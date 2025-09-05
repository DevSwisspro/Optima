-- Todo Coach App - Complete Database Schema Setup
-- This script creates all necessary tables, policies, and indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT DEFAULT 'personal',
    estimated_duration INTEGER DEFAULT 30, -- minutes
    actual_duration INTEGER,
    tags TEXT[] DEFAULT '{}',
    subtasks JSONB DEFAULT '[]'::jsonb
);

-- Create budget_items table
CREATE TABLE IF NOT EXISTS budget_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT CHECK (recurring_frequency IN ('weekly', 'monthly', 'yearly')) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create shopping_items table
CREATE TABLE IF NOT EXISTS shopping_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    estimated_price DECIMAL(8,2),
    actual_price DECIMAL(8,2),
    category TEXT DEFAULT 'general',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    is_purchased BOOLEAN DEFAULT FALSE,
    purchased_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notes TEXT
);

-- Create recurring_expenses table
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    frequency TEXT CHECK (frequency IN ('weekly', 'monthly', 'yearly')) NOT NULL,
    next_due_date DATE NOT NULL,
    last_paid_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    auto_pay BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT
);

-- Create budget_limits table
CREATE TABLE IF NOT EXISTS budget_limits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category TEXT NOT NULL,
    monthly_limit DECIMAL(10,2) NOT NULL,
    current_spent DECIMAL(10,2) DEFAULT 0,
    alert_threshold DECIMAL(3,2) DEFAULT 0.8, -- 80% by default
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(user_id, category)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    currency TEXT DEFAULT 'CHF',
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'Europe/Zurich',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks table
CREATE POLICY "Users can view their own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for budget_items table
CREATE POLICY "Users can view their own budget items" ON budget_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own budget items" ON budget_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget items" ON budget_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget items" ON budget_items FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for notes table
CREATE POLICY "Users can view their own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for shopping_items table
CREATE POLICY "Users can view their own shopping items" ON shopping_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own shopping items" ON shopping_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shopping items" ON shopping_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shopping items" ON shopping_items FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for recurring_expenses table
CREATE POLICY "Users can view their own recurring expenses" ON recurring_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own recurring expenses" ON recurring_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recurring expenses" ON recurring_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recurring expenses" ON recurring_expenses FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for budget_limits table
CREATE POLICY "Users can view their own budget limits" ON budget_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own budget limits" ON budget_limits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget limits" ON budget_limits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget limits" ON budget_limits FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_preferences table
CREATE POLICY "Users can view their own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own preferences" ON user_preferences FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON budget_items(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_category ON budget_items(category);
CREATE INDEX IF NOT EXISTS idx_budget_items_type ON budget_items(type);
CREATE INDEX IF NOT EXISTS idx_budget_items_date ON budget_items(date);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);

CREATE INDEX IF NOT EXISTS idx_shopping_items_user_id ON shopping_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_is_purchased ON shopping_items(is_purchased);
CREATE INDEX IF NOT EXISTS idx_shopping_items_category ON shopping_items(category);

CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_next_due_date ON recurring_expenses(next_due_date);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_is_active ON recurring_expenses(is_active);

CREATE INDEX IF NOT EXISTS idx_budget_limits_user_id ON budget_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_limits_category ON budget_limits(category);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_shopping_items_updated_at BEFORE UPDATE ON shopping_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_recurring_expenses_updated_at BEFORE UPDATE ON recurring_expenses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_budget_limits_updated_at BEFORE UPDATE ON budget_limits FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create function to automatically create user preferences on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user preferences
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert some sample categories for budget items
CREATE TABLE IF NOT EXISTS budget_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '💰',
    color TEXT DEFAULT '#3B82F6',
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default budget categories
INSERT INTO budget_categories (name, icon, color, description, is_system) VALUES
('Food & Dining', '🍽️', '#EF4444', 'Groceries, restaurants, and food delivery', true),
('Transportation', '🚗', '#10B981', 'Gas, public transport, car maintenance', true),
('Shopping', '🛍️', '#8B5CF6', 'Clothes, electronics, and general purchases', true),
('Entertainment', '🎭', '#F59E0B', 'Movies, games, subscriptions, and fun activities', true),
('Bills & Utilities', '⚡', '#DC2626', 'Electricity, water, internet, phone bills', true),
('Healthcare', '🏥', '#06B6D4', 'Medical expenses, pharmacy, insurance', true),
('Education', '📚', '#7C3AED', 'Courses, books, training, and learning', true),
('Savings', '💰', '#059669', 'Emergency fund, investments, retirement', true),
('Housing', '🏠', '#2563EB', 'Rent, mortgage, home maintenance', true),
('Personal Care', '💄', '#EC4899', 'Haircuts, cosmetics, spa treatments', true)
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE tasks IS 'User tasks and todos with priority and status tracking';
COMMENT ON TABLE budget_items IS 'Income and expense tracking with categorization';
COMMENT ON TABLE notes IS 'User notes with tagging and categorization';
COMMENT ON TABLE shopping_items IS 'Shopping list items with price tracking';
COMMENT ON TABLE recurring_expenses IS 'Recurring bills and subscription management';
COMMENT ON TABLE budget_limits IS 'Monthly budget limits per category with alerts';
COMMENT ON TABLE user_preferences IS 'User-specific preferences and settings';
COMMENT ON TABLE budget_categories IS 'Predefined and custom budget categories';