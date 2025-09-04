import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2, Sparkles, Search, List, FileText, ShoppingCart, Wallet, BarChart3, ArrowLeft, TrendingUp, PieChart as PieChartIcon, Calendar, Table, Download, Filter, ChevronLeft, ChevronRight, Settings, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, LabelList } from 'recharts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { formatCurrency } from "@/lib/utils";
import LogoDevSwiss from "@/components/LogoDevSwiss";

// --- Helpers -----------------------------------------------------------
const LS_KEY = "todo_coach_v2";
const LS_NOTES_KEY = "todo_coach_notes_v1";
const LS_SHOPPING_KEY = "todo_coach_shopping_v1";
const LS_BUDGET_KEY = "todo_coach_budget_v1";
const LS_RECURRING_KEY = "todo_coach_recurring_v1";
const LS_BUDGET_LIMITS_KEY = "todo_coach_budget_limits_v1";
const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// Fonctions utilitaires pour le dashboard
const processMonthlyData = (budgetItems, year) => {
  const months = Array.from({ length: 12 }, (_, i) => ({
    name: new Date(2024, i).toLocaleDateString('fr-FR', { month: 'short' }),
    revenus: 0,
    depenses_fixes: 0,
    depenses_variables: 0,
    epargne: 0,
    investissements: 0,
    solde: 0
  }));

  budgetItems.forEach(item => {
    const itemDate = new Date(item.date);
    if (itemDate.getFullYear() === year) {
      const monthIndex = itemDate.getMonth();
      const amount = parseFloat(item.amount) || 0;
      
      if (item.type === 'revenus') {
        months[monthIndex].revenus += amount;
      } else {
        months[monthIndex][item.type] += amount;
      }
    }
  });

  // Calculer le solde pour chaque mois
  months.forEach(month => {
    month.solde = month.revenus - (month.depenses_fixes + month.depenses_variables + month.epargne + month.investissements);
  });

  return months;
};

const processYearlyData = (budgetItems, years) => {
  return years.map(year => {
    const yearData = {
      year: year.toString(),
      revenus: 0,
      depenses_fixes: 0,
      depenses_variables: 0,
      epargne: 0,
      investissements: 0,
      solde: 0
    };

    budgetItems.forEach(item => {
      const itemDate = new Date(item.date);
      if (itemDate.getFullYear() === year) {
        const amount = parseFloat(item.amount) || 0;
        
        if (item.type === 'revenus') {
          yearData.revenus += amount;
        } else {
          yearData[item.type] += amount;
        }
      }
    });

    yearData.solde = yearData.revenus - (yearData.depenses_fixes + yearData.depenses_variables + yearData.epargne + yearData.investissements);
    return yearData;
  });
};

const getAvailableYears = (budgetItems) => {
  const years = [...new Set(budgetItems.map(item => new Date(item.date).getFullYear()))];
  return years.sort((a, b) => b - a); // Du plus récent au plus ancien
};

const colors = {
  revenus: '#10b981',
  depenses_fixes: '#ef4444', 
  depenses_variables: '#f97316',
  epargne: '#3b82f6',
  investissements: '#8b5cf6',
  solde: '#6b7280'
};

// Palette de couleurs uniques pour les catégories
const categoryColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', 
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#c026d3', '#d946ef', '#ec4899', '#f43f5e',
  '#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a',
  '#059669', '#0d9488', '#0891b2', '#0284c7', '#2563eb', '#4f46e5',
  '#7c3aed', '#9333ea', '#a21caf', '#be185d', '#be123c', '#991b1b'
];

const getCategoryColor = (category, index) => {
  return categoryColors[index % categoryColors.length];
};

// Fonctions utilitaires pour les vues détaillées
const processCategoriesData = (budgetItems, year) => {
  const categories = {};
  
  budgetItems.forEach(item => {
    const itemDate = new Date(item.date);
    if (itemDate.getFullYear() === year) {
      let amount = parseFloat(item.amount) || 0;
      
      // Convertir les montants selon le type
      if (item.type === 'depenses_fixes' || item.type === 'depenses_variables') {
        amount = -Math.abs(amount); // Dépenses = négatives
      } else {
        amount = Math.abs(amount); // Revenus, épargne, investissements = positifs
      }
      
      if (!categories[item.category]) {
        categories[item.category] = {
          name: BUDGET_CATEGORIES[item.type]?.[item.category] || item.category,
          value: 0,
          type: item.type,
          category: item.category
        };
      }
      categories[item.category].value += amount;
    }
  });

  const categoriesArray = Object.values(categories).filter(cat => cat.value !== 0);
  
  // Assigner des couleurs uniques à chaque catégorie
  categoriesArray.forEach((cat, index) => {
    cat.fill = getCategoryColor(cat.category, index);
  });

  return categoriesArray.sort((a, b) => b.value - a.value);
};

const formatPeriodName = (period) => {
  if (period.month) {
    // Mois spécifique
    return `${new Date(2024, period.month - 1).toLocaleDateString('fr-FR', { month: 'long' })} ${period.year}`;
  } else if (period.quarter) {
    // Trimestre spécifique
    const quarterNames = {
      'Q1': 'Q1 (Jan-Mar)',
      'Q2': 'Q2 (Avr-Juin)',
      'Q3': 'Q3 (Juil-Sept)',
      'Q4': 'Q4 (Oct-Déc)'
    };
    return `${quarterNames[period.quarter]} ${period.year}`;
  } else {
    // Toute l'année
    return `Année ${period.year}`;
  }
};

// Fonction pour obtenir les données comparatives selon la granularité
const getComparativeData = (budgetItems, period1, period2, granularity) => {
  const getQuarterMonths = (quarter) => {
    switch (quarter) {
      case 'Q1': return [1, 2, 3];
      case 'Q2': return [4, 5, 6];
      case 'Q3': return [7, 8, 9];
      case 'Q4': return [10, 11, 12];
      default: return [];
    }
  };

  const getData = (period) => {
    return budgetItems.filter(item => {
      const itemDate = new Date(item.date);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth() + 1;
      
      if (itemYear !== period.year) return false;
      
      if (period.month) {
        return itemMonth === period.month;
      } else if (period.quarter) {
        const quarterMonths = getQuarterMonths(period.quarter);
        return quarterMonths.includes(itemMonth);
      } else {
        return true;
      }
    });
  };

  const data1 = getData(period1);
  const data2 = getData(period2);

  if (granularity === 'types') {
    // Données par types (comme avant)
    const processTypeData = (data) => {
      return {
        revenus: data.filter(item => item.type === 'revenus').reduce((sum, item) => sum + Math.abs(parseFloat(item.amount) || 0), 0),
        depenses_fixes: data.filter(item => item.type === 'depenses_fixes').reduce((sum, item) => sum + Math.abs(parseFloat(item.amount) || 0), 0),
        depenses_variables: data.filter(item => item.type === 'depenses_variables').reduce((sum, item) => sum + Math.abs(parseFloat(item.amount) || 0), 0),
        epargne: data.filter(item => item.type === 'epargne').reduce((sum, item) => sum + Math.abs(parseFloat(item.amount) || 0), 0),
        investissements: data.filter(item => item.type === 'investissements').reduce((sum, item) => sum + Math.abs(parseFloat(item.amount) || 0), 0)
      };
    };
    
    return {
      period1: processTypeData(data1),
      period2: processTypeData(data2),
      isDetailed: false
    };
  } else {
    // Données par catégories détaillées
    const getCategories = (data) => {
      const categories = {};
      data.forEach(item => {
        const category = item.category || 'Autre';
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += Math.abs(parseFloat(item.amount) || 0);
      });
      return categories;
    };
    
    const cats1 = getCategories(data1);
    const cats2 = getCategories(data2);
    
    // Fusionner toutes les catégories
    const allCategories = new Set([...Object.keys(cats1), ...Object.keys(cats2)]);
    
    const result = {
      period1: {},
      period2: {},
      isDetailed: true
    };
    
    allCategories.forEach(cat => {
      result.period1[cat] = cats1[cat] || 0;
      result.period2[cat] = cats2[cat] || 0;
    });
    
    return result;
  }
};

const comparePeriodsData = (budgetItems, period1, period2, compareType) => {
  const getQuarterMonths = (quarter) => {
    switch (quarter) {
      case 'Q1': return [1, 2, 3];
      case 'Q2': return [4, 5, 6];
      case 'Q3': return [7, 8, 9];
      case 'Q4': return [10, 11, 12];
      default: return [];
    }
  };

  const getData = (period) => {
    return budgetItems.filter(item => {
      const itemDate = new Date(item.date);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth() + 1;
      
      // Vérifier l'année
      if (itemYear !== period.year) return false;
      
      // Filtrer par période spécifique
      if (period.month) {
        // Mois spécifique
        return itemMonth === period.month;
      } else if (period.quarter) {
        // Trimestre spécifique
        const quarterMonths = getQuarterMonths(period.quarter);
        return quarterMonths.includes(itemMonth);
      } else {
        // Toute l'année
        return true;
      }
    });
  };

  const data1 = getData(period1);
  const data2 = getData(period2);

  const processData = (data) => {
    return {
      revenus: data
        .filter(item => item.type === 'revenus')
        .reduce((sum, item) => sum + Math.abs(parseFloat(item.amount) || 0), 0),
      depenses_fixes: data
        .filter(item => item.type === 'depenses_fixes')
        .reduce((sum, item) => sum + Math.abs(parseFloat(item.amount) || 0), 0),
      depenses_variables: data
        .filter(item => item.type === 'depenses_variables')
        .reduce((sum, item) => sum + Math.abs(parseFloat(item.amount) || 0), 0),
      epargne: data
        .filter(item => item.type === 'epargne')
        .reduce((sum, item) => sum + Math.abs(parseFloat(item.amount) || 0), 0),
      investissements: data
        .filter(item => item.type === 'investissements')
        .reduce((sum, item) => sum + Math.abs(parseFloat(item.amount) || 0), 0)
    };
  };

  return {
    period1: processData(data1),
    period2: processData(data2)
  };
};

const getTableData = (budgetItems, config) => {
  let filteredItems = budgetItems;
  
  // Filtre par année
  if (config.year) {
    filteredItems = filteredItems.filter(item => {
      const itemYear = new Date(item.date).getFullYear();
      return itemYear === config.year;
    });
  }
  
  // Filtre par type
  if (config.filterType !== 'all') {
    filteredItems = filteredItems.filter(item => item.type === config.filterType);
  }

  // Tri
  filteredItems.sort((a, b) => {
    if (config.sortBy === 'date') {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return config.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (config.sortBy === 'amount') {
      const amountA = parseFloat(a.amount);
      const amountB = parseFloat(b.amount);
      return config.sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
    }
    return 0;
  });

  // Pagination
  const startIndex = (config.currentPage - 1) * config.itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + config.itemsPerPage);

  return {
    items: paginatedItems,
    totalItems: filteredItems.length,
    totalPages: Math.ceil(filteredItems.length / config.itemsPerPage)
  };
};

const exportToCSV = (budgetItems) => {
  const headers = ['Date', 'Type', 'Catégorie', 'Montant', 'Description'];
  const csvContent = [
    headers.join(','),
    ...budgetItems.map(item => [
      item.date,
      item.type,
      BUDGET_CATEGORIES[item.type]?.[item.category] || item.category,
      item.amount,
      `"${item.description.replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `budget_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Traductions des priorités
const PRIORITY_LABELS = {
  urgent: "À faire rapidement",
  normal: "À faire prochainement", 
  low: "À faire plus tard"
};

// Ordre des priorités
const PRIORITY_ORDER = { urgent: 0, normal: 1, low: 2 };

// Catégories des courses
const SHOPPING_CATEGORIES = {
  courant: "Courses courantes",
  futur: "Achats futurs"
};

// Unités de mesure
const MEASUREMENT_UNITS = {
  kg: "kg",
  g: "g",
  L: "L",
  mL: "mL",
  p: "p",
  bouteilles: "bouteilles",
  sacs: "sacs",
  boites: "boîtes",
  paquets: "paquets",
  tranches: "tranches",
  autres: "autres"
};

// Catégories de budget
const BUDGET_CATEGORIES = {
  revenus: { 
    salaire: "Salaire", 
    revenus_locatifs: "Revenus locatifs", 
    activite_secondaire: "Activité secondaire", 
    dividendes: "Dividendes", 
    indemnites: "Indemnités & allocations", 
    remboursements: "Remboursements", 
    ventes: "Ventes occasionnelles", 
    cadeaux: "Cadeaux / Bonus", 
    autres: "Autres revenus" 
  },
  depenses_fixes: { 
    loyer: "Loyer", 
    abonnements: "Abonnements", 
    assurances: "Assurances", 
    credits: "Crédits / Prêts", 
    telephonie: "Téléphonie & Internet"
  },
  depenses_variables: { 
    alimentation: "Alimentation", 
    restaurants: "Restaurants", 
    bars_sorties: "Bars & Sorties", 
    loisirs: "Loisirs & Activités", 
    sante: "Santé", 
    shopping: "Shopping", 
    deplacements: "Déplacements ponctuels", 
    vacances: "Vacances", 
    evenements: "Événements / Cadeaux", 
    entretien: "Entretien logement", 
    imprevus: "Imprévus" 
  },
  epargne: { 
    compte_epargne: "Compte épargne", 
    pilier3: "Troisième pilier", 
    fonds_secours: "Fonds de secours", 
    projets_long_terme: "Projets long terme" 
  },
  investissements: { 
    bourse: "Bourse", 
    crypto: "Crypto", 
    immobilier: "Immobilier", 
    crowdfunding: "Crowdfunding", 
    autres: "Autres" 
  }
};

// --- NLP simplifié ------------------------------------------------------
function parseTaskNLP(raw) {
  if (!raw) return { title: "", priority: "normal" };
  let text = raw.trim();
  let priority = "normal";
  if (/(!|#p1)/i.test(text)) { priority = "urgent"; text = text.replace(/(!|#p1)/i, "").trim(); }
  else if (/#p3/i.test(text)) { priority = "low"; text = text.replace(/#p3/i, "").trim(); }
  return { title: text, priority };
}

function ding() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine"; o.frequency.value = 880;
  o.connect(g); g.connect(ctx.destination);
  g.gain.setValueAtTime(0.001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  o.start(); o.stop(ctx.currentTime + 0.16);
}

// --- Main App ---------------------------------------------------------------
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState({ q: "" });
  const [input, setInput] = useState("");
  const [priorityChoice, setPriorityChoice] = useState("normal");
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const priorityMenuRef = useRef(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // États pour le dashboard
  const [dashboardFilter, setDashboardFilter] = useState({
    year: new Date().getFullYear(),
    month: 'all', // 'all' ou numéro du mois (1-12)
    type: 'all' // 'all' ou type spécifique
  });

  // États pour le dashboard budget détaillé
  const [budgetDashboardView, setBudgetDashboardView] = useState("monthly"); // 'monthly', 'categories', 'comparative', 'table'
  
  // États pour vue comparative
  const [compareConfig, setCompareConfig] = useState({
    type: 'months', // 'months' ou 'years'
    period1: { year: 2025, month: 8 }, // Août 2025
    period2: { year: 2025, month: 9 }  // Septembre 2025
  });
  
  // États pour vues Mensuel et Catégories
  const [monthlyViewYear, setMonthlyViewYear] = useState(new Date().getFullYear());
  const [categoriesViewYear, setCategoriesViewYear] = useState(new Date().getFullYear());
  
  // États pour les paramètres
  const [showSettings, setShowSettings] = useState(false);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [budgetLimits, setBudgetLimits] = useState({
    // Budgets par catégorie pour dépenses variables
    categories: {
      alimentation: 0,
      restaurants: 0,
      bars_sorties: 0,
      loisirs: 0,
      shopping: 0,
      entretien: 0
    },
    // Budgets par catégorie pour épargne
    epargne: {
      compte_epargne: 0,
      pilier3: 0
    },
    // Budgets par catégorie pour investissements
    investissements: {
      bourse: 0,
      crypto: 0,
      immobilier: 0,
      crowdfunding: 0
    },
    // Objectifs à long terme
    longTerm: {
      epargne: 0,
      investissements: 0
    }
  });
  const [settingsTab, setSettingsTab] = useState('recurring');
  const [newRecurringExpense, setNewRecurringExpense] = useState({
    amount: '',
    category: 'loyer',
    dayOfMonth: 1
  });
  
  // État pour la granularité de la vue comparative
  const [compareGranularity, setCompareGranularity] = useState("types"); // 'types' ou 'categories'

  // Fonction pour s'assurer que les périodes sont différentes
  const ensureDifferentPeriods = (config) => {
    if (config.type === 'months') {
      // Si même année et même mois, changer le mois de la période 2
      if (config.period1.year === config.period2.year && config.period1.month === config.period2.month) {
        const newMonth = config.period1.month === 12 ? 1 : config.period1.month + 1;
        return {
          ...config,
          period2: { ...config.period2, month: newMonth }
        };
      }
    } else {
      // Si même année, changer l'année de la période 2
      if (config.period1.year === config.period2.year) {
        return {
          ...config,
          period2: { ...config.period2, year: config.period1.year - 1 }
        };
      }
    }
    return config;
  };

  // États pour vue tableau
  const [tableConfig, setTableConfig] = useState({
    currentPage: 1,
    itemsPerPage: 20,
    sortBy: 'date',
    sortOrder: 'desc',
    filterType: 'all',
    year: new Date().getFullYear()
  });
  
  // États pour les notes
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [noteFilter, setNoteFilter] = useState({ q: "" });
  
  // États pour les courses
  const [shoppingItems, setShoppingItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemUnit, setItemUnit] = useState("p");
  const [itemCategory, setItemCategory] = useState("courant");
  const [editingItem, setEditingItem] = useState(null);
  const [shoppingFilter, setShoppingFilter] = useState({});

  // États pour le budget
  const [budgetItems, setBudgetItems] = useState([]);
  const [budgetDescription, setBudgetDescription] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetType, setBudgetType] = useState("revenus");
  const [budgetCategory, setBudgetCategory] = useState("salaire");
  const [budgetDate, setBudgetDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingBudgetItem, setEditingBudgetItem] = useState(null);
  const [budgetFilter, setBudgetFilter] = useState({});

  useEffect(() => {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) setTasks(JSON.parse(raw)); } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(tasks)); } catch {}
  }, [tasks]);

  // Charger les notes depuis le localStorage
  useEffect(() => {
    try { 
      const raw = localStorage.getItem(LS_NOTES_KEY); 
      if (raw) setNotes(JSON.parse(raw)); 
    } catch {}
  }, []);

  // Sauvegarder les notes dans le localStorage
  useEffect(() => {
    try { localStorage.setItem(LS_NOTES_KEY, JSON.stringify(notes)); } catch {}
  }, [notes]);

  // Charger les courses depuis le localStorage
  useEffect(() => {
    try { 
      const raw = localStorage.getItem(LS_SHOPPING_KEY); 
      if (raw) setShoppingItems(JSON.parse(raw)); 
    } catch {}
  }, []);

  // Sauvegarder les courses dans le localStorage
  useEffect(() => {
    try { localStorage.setItem(LS_SHOPPING_KEY, JSON.stringify(shoppingItems)); } catch {}
  }, [shoppingItems]);

  // Charger les paramètres depuis le localStorage
  useEffect(() => {
    try { 
      const rawRecurring = localStorage.getItem(LS_RECURRING_KEY);
      if (rawRecurring) setRecurringExpenses(JSON.parse(rawRecurring));
      
      const rawLimits = localStorage.getItem(LS_BUDGET_LIMITS_KEY);
      if (rawLimits) setBudgetLimits(JSON.parse(rawLimits));
    } catch {}
  }, []);

  // Sauvegarder les dépenses récurrentes dans le localStorage
  useEffect(() => {
    try { localStorage.setItem(LS_RECURRING_KEY, JSON.stringify(recurringExpenses)); } catch {}
  }, [recurringExpenses]);

  // Sauvegarder les limites de budget dans le localStorage  
  useEffect(() => {
    try { localStorage.setItem(LS_BUDGET_LIMITS_KEY, JSON.stringify(budgetLimits)); } catch {}
  }, [budgetLimits]);

  // Gérer la fermeture du menu de priorité au clic externe
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (priorityMenuRef.current && !priorityMenuRef.current.contains(event.target)) {
        setShowPriorityMenu(false);
      }
    };

    if (showPriorityMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPriorityMenu]);

  // Générer des données de test pour la démonstration
  const generateTestData = () => {
    const testData = [
      // Janvier 2025
      { id: 'test1', date: '2025-01-05', type: 'revenus', category: 'salaire', amount: '8500', description: 'Salaire janvier' },
      { id: 'test2', date: '2025-01-01', type: 'depenses_fixes', category: 'loyer', amount: '1500', description: 'Loyer appartement' },
      { id: 'test3', date: '2025-01-03', type: 'depenses_variables', category: 'alimentation', amount: '450', description: 'Courses mensuelles' },
      { id: 'test4', date: '2025-01-15', type: 'epargne', category: 'compte_epargne', amount: '800', description: 'Épargne mensuelle' },
      { id: 'test5', date: '2025-01-20', type: 'investissements', category: 'bourse', amount: '500', description: 'Achat actions' },
      
      // Février 2025
      { id: 'test6', date: '2025-02-05', type: 'revenus', category: 'salaire', amount: '8500', description: 'Salaire février' },
      { id: 'test7', date: '2025-02-01', type: 'depenses_fixes', category: 'loyer', amount: '1500', description: 'Loyer appartement' },
      { id: 'test8', date: '2025-02-03', type: 'depenses_variables', category: 'alimentation', amount: '380', description: 'Courses mensuelles' },
      { id: 'test9', date: '2025-02-14', type: 'depenses_variables', category: 'restaurants', amount: '120', description: 'Saint-Valentin' },
      { id: 'test10', date: '2025-02-15', type: 'epargne', category: 'compte_epargne', amount: '800', description: 'Épargne mensuelle' },
      { id: 'test11', date: '2025-02-25', type: 'investissements', category: 'crypto', amount: '300', description: 'Bitcoin' },
      
      // Mars 2025
      { id: 'test12', date: '2025-03-05', type: 'revenus', category: 'salaire', amount: '8500', description: 'Salaire mars' },
      { id: 'test13', date: '2025-03-01', type: 'depenses_fixes', category: 'loyer', amount: '1500', description: 'Loyer appartement' },
      { id: 'test14', date: '2025-03-03', type: 'depenses_variables', category: 'alimentation', amount: '420', description: 'Courses mensuelles' },
      { id: 'test15', date: '2025-03-10', type: 'depenses_variables', category: 'shopping', amount: '250', description: 'Vêtements printemps' },
      { id: 'test16', date: '2025-03-15', type: 'epargne', category: 'compte_epargne', amount: '900', description: 'Épargne mensuelle +' },
      { id: 'test17', date: '2025-03-20', type: 'investissements', category: 'bourse', amount: '600', description: 'Diversification portfolio' },
      
      // Avril 2025
      { id: 'test18', date: '2025-04-05', type: 'revenus', category: 'salaire', amount: '8500', description: 'Salaire avril' },
      { id: 'test19', date: '2025-04-10', type: 'revenus', category: 'activite_secondaire', amount: '800', description: 'Freelance' },
      { id: 'test20', date: '2025-04-01', type: 'depenses_fixes', category: 'loyer', amount: '1500', description: 'Loyer appartement' },
      { id: 'test21', date: '2025-04-03', type: 'depenses_variables', category: 'alimentation', amount: '390', description: 'Courses mensuelles' },
      { id: 'test22', date: '2025-04-18', type: 'depenses_variables', category: 'vacances', amount: '800', description: 'Week-end Pâques' },
      { id: 'test23', date: '2025-04-15', type: 'epargne', category: 'pilier3', amount: '400', description: '3ème pilier' },
      { id: 'test24', date: '2025-04-25', type: 'investissements', category: 'immobilier', amount: '1000', description: 'REIT' },
      
      // Mai 2025
      { id: 'test25', date: '2025-05-05', type: 'revenus', category: 'salaire', amount: '8500', description: 'Salaire mai' },
      { id: 'test26', date: '2025-05-01', type: 'depenses_fixes', category: 'loyer', amount: '1500', description: 'Loyer appartement' },
      { id: 'test27', date: '2025-05-03', type: 'depenses_variables', category: 'alimentation', amount: '410', description: 'Courses mensuelles' },
      { id: 'test28', date: '2025-05-12', type: 'depenses_variables', category: 'loisirs', amount: '180', description: 'Concert' },
      { id: 'test29', date: '2025-05-15', type: 'epargne', category: 'compte_epargne', amount: '850', description: 'Épargne mensuelle' },
      { id: 'test30', date: '2025-05-22', type: 'investissements', category: 'bourse', amount: '450', description: 'ETF World' },
      
      // Juin 2025
      { id: 'test31', date: '2025-06-05', type: 'revenus', category: 'salaire', amount: '8500', description: 'Salaire juin' },
      { id: 'test32', date: '2025-06-01', type: 'depenses_fixes', category: 'loyer', amount: '1500', description: 'Loyer appartement' },
      { id: 'test33', date: '2025-06-03', type: 'depenses_variables', category: 'alimentation', amount: '380', description: 'Courses mensuelles' },
      { id: 'test34', date: '2025-06-20', type: 'depenses_variables', category: 'vacances', amount: '1200', description: 'Vacances été' },
      { id: 'test35', date: '2025-06-15', type: 'epargne', category: 'projets_long_terme', amount: '600', description: 'Projet maison' },
      { id: 'test36', date: '2025-06-25', type: 'investissements', category: 'crypto', amount: '300', description: 'DCA crypto' },
      
      // Juillet 2025
      { id: 'test37', date: '2025-07-05', type: 'revenus', category: 'salaire', amount: '8500', description: 'Salaire juillet' },
      { id: 'test38', date: '2025-07-01', type: 'depenses_fixes', category: 'loyer', amount: '1500', description: 'Loyer appartement' },
      { id: 'test39', date: '2025-07-03', type: 'depenses_variables', category: 'alimentation', amount: '320', description: 'Courses réduites (vacances)' },
      { id: 'test40', date: '2025-07-10', type: 'depenses_variables', category: 'vacances', amount: '1800', description: 'Vacances été principales' },
      { id: 'test41', date: '2025-07-15', type: 'epargne', category: 'compte_epargne', amount: '700', description: 'Épargne réduite (vacances)' },
      
      // Août 2025
      { id: 'test42', date: '2025-08-05', type: 'revenus', category: 'salaire', amount: '8500', description: 'Salaire août' },
      { id: 'test43', date: '2025-08-01', type: 'depenses_fixes', category: 'loyer', amount: '1500', description: 'Loyer appartement' },
      { id: 'test44', date: '2025-08-03', type: 'depenses_variables', category: 'alimentation', amount: '440', description: 'Courses mensuelles' },
      { id: 'test45', date: '2025-08-12', type: 'depenses_variables', category: 'shopping', amount: '300', description: 'Rentrée scolaire' },
      { id: 'test46', date: '2025-08-15', type: 'epargne', category: 'compte_epargne', amount: '800', description: 'Épargne mensuelle' },
      { id: 'test47', date: '2025-08-20', type: 'investissements', category: 'bourse', amount: '550', description: 'Opportunité marché' },
      
      // Septembre 2025 (complet)
      { id: 'test48', date: '2025-09-02', type: 'revenus', category: 'salaire', amount: '8500', description: 'Salaire septembre' },
      { id: 'test49', date: '2025-09-01', type: 'depenses_fixes', category: 'loyer', amount: '1500', description: 'Loyer appartement' },
      { id: 'test50', date: '2025-09-02', type: 'depenses_variables', category: 'alimentation', amount: '420', description: 'Courses mensuelles' },
      { id: 'test51', date: '2025-09-15', type: 'epargne', category: 'compte_epargne', amount: '850', description: 'Épargne mensuelle' },
      { id: 'test52', date: '2025-09-20', type: 'investissements', category: 'bourse', amount: '400', description: 'Investissement mensuel' },
      
      // Octobre 2025
      { id: 'test53', date: '2025-10-05', type: 'revenus', category: 'salaire', amount: '8500', description: 'Salaire octobre' },
      { id: 'test54', date: '2025-10-01', type: 'depenses_fixes', category: 'loyer', amount: '1500', description: 'Loyer appartement' },
      { id: 'test55', date: '2025-10-03', type: 'depenses_variables', category: 'alimentation', amount: '390', description: 'Courses mensuelles' },
      { id: 'test56', date: '2025-10-31', type: 'depenses_variables', category: 'loisirs', amount: '150', description: 'Halloween' },
      { id: 'test57', date: '2025-10-15', type: 'epargne', category: 'compte_epargne', amount: '800', description: 'Épargne mensuelle' },
      { id: 'test58', date: '2025-10-25', type: 'investissements', category: 'crypto', amount: '350', description: 'DCA octobre' },
      
      // Novembre 2025
      { id: 'test59', date: '2025-11-05', type: 'revenus', category: 'salaire', amount: '8500', description: 'Salaire novembre' },
      { id: 'test60', date: '2025-11-01', type: 'depenses_fixes', category: 'loyer', amount: '1500', description: 'Loyer appartement' },
      { id: 'test61', date: '2025-11-03', type: 'depenses_variables', category: 'alimentation', amount: '400', description: 'Courses mensuelles' },
      { id: 'test62', date: '2025-11-15', type: 'depenses_variables', category: 'shopping', amount: '250', description: 'Black Friday' },
      { id: 'test63', date: '2025-11-15', type: 'epargne', category: 'pilier3', amount: '500', description: '3ème pilier fin année' },
      { id: 'test64', date: '2025-11-25', type: 'investissements', category: 'bourse', amount: '600', description: 'Investissement automne' },
      
      // Décembre 2025
      { id: 'test65', date: '2025-12-05', type: 'revenus', category: 'salaire', amount: '8500', description: 'Salaire décembre' },
      { id: 'test66', date: '2025-12-20', type: 'revenus', category: 'cadeaux', amount: '500', description: 'Prime de fin d\'année' },
      { id: 'test67', date: '2025-12-01', type: 'depenses_fixes', category: 'loyer', amount: '1500', description: 'Loyer appartement' },
      { id: 'test68', date: '2025-12-03', type: 'depenses_variables', category: 'alimentation', amount: '450', description: 'Courses + fêtes' },
      { id: 'test69', date: '2025-12-15', type: 'depenses_variables', category: 'shopping', amount: '800', description: 'Cadeaux de Noël' },
      { id: 'test70', date: '2025-12-31', type: 'depenses_variables', category: 'restaurants', amount: '200', description: 'Réveillon' },
      { id: 'test71', date: '2025-12-15', type: 'epargne', category: 'compte_epargne', amount: '900', description: 'Épargne fin année' },
      { id: 'test72', date: '2025-12-28', type: 'investissements', category: 'immobilier', amount: '1200', description: 'Investissement fin année' },
      
      // ======= DONNÉES 2024 POUR COMPARAISON =======
      // Janvier 2024
      { id: 'test2024_1', date: '2024-01-05', type: 'revenus', category: 'salaire', amount: '8000', description: 'Salaire janvier 2024' },
      { id: 'test2024_2', date: '2024-01-01', type: 'depenses_fixes', category: 'loyer', amount: '1400', description: 'Loyer 2024' },
      { id: 'test2024_3', date: '2024-01-03', type: 'depenses_variables', category: 'alimentation', amount: '400', description: 'Courses janvier 2024' },
      { id: 'test2024_4', date: '2024-01-15', type: 'epargne', category: 'compte_epargne', amount: '700', description: 'Épargne janvier 2024' },
      { id: 'test2024_5', date: '2024-01-20', type: 'investissements', category: 'bourse', amount: '300', description: 'Investissement janvier 2024' },
      
      // Juillet 2024 (pour comparaison mois)
      { id: 'test2024_37', date: '2024-07-05', type: 'revenus', category: 'salaire', amount: '8000', description: 'Salaire juillet 2024' },
      { id: 'test2024_38', date: '2024-07-01', type: 'depenses_fixes', category: 'loyer', amount: '1400', description: 'Loyer juillet 2024' },
      { id: 'test2024_39', date: '2024-07-03', type: 'depenses_variables', category: 'alimentation', amount: '350', description: 'Courses juillet 2024' },
      { id: 'test2024_40', date: '2024-07-10', type: 'depenses_variables', category: 'vacances', amount: '1500', description: 'Vacances été 2024' },
      { id: 'test2024_41', date: '2024-07-15', type: 'epargne', category: 'compte_epargne', amount: '600', description: 'Épargne juillet 2024' },
      { id: 'test2024_42', date: '2024-07-20', type: 'investissements', category: 'bourse', amount: '400', description: 'Investissement juillet 2024' },
      
      // Septembre 2024 (pour comparaison avec septembre 2025)
      { id: 'test2024_48', date: '2024-09-02', type: 'revenus', category: 'salaire', amount: '8000', description: 'Salaire septembre 2024' },
      { id: 'test2024_49', date: '2024-09-01', type: 'depenses_fixes', category: 'loyer', amount: '1400', description: 'Loyer septembre 2024' },
      { id: 'test2024_50', date: '2024-09-02', type: 'depenses_variables', category: 'alimentation', amount: '380', description: 'Courses septembre 2024' },
      { id: 'test2024_51', date: '2024-09-15', type: 'depenses_variables', category: 'shopping', amount: '200', description: 'Rentrée 2024' },
      { id: 'test2024_52', date: '2024-09-15', type: 'epargne', category: 'compte_epargne', amount: '750', description: 'Épargne septembre 2024' },
      { id: 'test2024_53', date: '2024-09-20', type: 'investissements', category: 'bourse', amount: '350', description: 'Investissement septembre 2024' },
      
      // Décembre 2024
      { id: 'test2024_65', date: '2024-12-05', type: 'revenus', category: 'salaire', amount: '8000', description: 'Salaire décembre 2024' },
      { id: 'test2024_66', date: '2024-12-20', type: 'revenus', category: 'cadeaux', amount: '300', description: 'Prime 2024' },
      { id: 'test2024_67', date: '2024-12-01', type: 'depenses_fixes', category: 'loyer', amount: '1400', description: 'Loyer décembre 2024' },
      { id: 'test2024_68', date: '2024-12-03', type: 'depenses_variables', category: 'alimentation', amount: '420', description: 'Courses décembre 2024' },
      { id: 'test2024_69', date: '2024-12-15', type: 'depenses_variables', category: 'shopping', amount: '600', description: 'Cadeaux Noël 2024' },
      { id: 'test2024_70', date: '2024-12-15', type: 'epargne', category: 'compte_epargne', amount: '800', description: 'Épargne décembre 2024' },
      { id: 'test2024_71', date: '2024-12-28', type: 'investissements', category: 'immobilier', amount: '800', description: 'Investissement décembre 2024' }
    ];
    return testData;
  };

  // Fonction pour ajouter automatiquement les dépenses récurrentes
  const addRecurringExpenses = () => {
    if (recurringExpenses.length === 0) return;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Vérifier si les dépenses du mois courant ont déjà été ajoutées
    const alreadyAdded = budgetItems.some(item => {
      const itemDate = new Date(item.date);
      return item.isRecurring && 
             itemDate.getFullYear() === currentYear && 
             itemDate.getMonth() === currentMonth;
    });

    if (alreadyAdded) return;

    // Ajouter chaque dépense récurrente pour le mois courant
    const newItems = recurringExpenses.map(expense => {
      const expenseDate = new Date(currentYear, currentMonth, expense.dayOfMonth);
      
      // Si le jour configuré est déjà passé ce mois, l'ajouter à la date courante
      if (expenseDate < currentDate) {
        expenseDate.setDate(currentDate.getDate());
      }

      return {
        id: `recurring_${expense.id}_${currentYear}_${currentMonth}`,
        date: expenseDate.toISOString().split('T')[0],
        type: 'depenses_fixes',
        category: expense.category,
        amount: expense.amount.toString(),
        description: `${BUDGET_CATEGORIES.depenses_fixes[expense.category]} (automatique)`,
        isRecurring: true
      };
    });

    setBudgetItems(prevItems => [...prevItems, ...newItems]);
  };

  // Vérifie et ajoute les dépenses récurrentes quand la liste change ou au chargement
  useEffect(() => {
    if (recurringExpenses.length > 0) {
      const timer = setTimeout(addRecurringExpenses, 1000); // Délai pour éviter conflits
      return () => clearTimeout(timer);
    }
  }, [recurringExpenses, budgetItems]);

  // Charger le budget depuis le localStorage ou forcer les données de test
  useEffect(() => {
    // FORCER LES DONNÉES DE TEST (à décommenter pour réinitialiser)
    const FORCE_TEST_DATA = true; // Mettre à false après test
    
    if (FORCE_TEST_DATA) {
      const testData = generateTestData();
      setBudgetItems(testData);
      localStorage.setItem(LS_BUDGET_KEY, JSON.stringify(testData));
      return;
    }

    try { 
      const raw = localStorage.getItem(LS_BUDGET_KEY); 
      if (raw) {
        const parsedData = JSON.parse(raw);
        // Vérifier si on a des données valides
        if (parsedData && parsedData.length > 0) {
          setBudgetItems(parsedData);
        } else {
          // Si array vide, charger les données de test
          const testData = generateTestData();
          setBudgetItems(testData);
          localStorage.setItem(LS_BUDGET_KEY, JSON.stringify(testData));
        }
      } else {
        // Si pas de données sauvegardées, charger les données de test
        const testData = generateTestData();
        setBudgetItems(testData);
        localStorage.setItem(LS_BUDGET_KEY, JSON.stringify(testData));
      }
    } catch {
      // En cas d'erreur, charger les données de test
      const testData = generateTestData();
      setBudgetItems(testData);
      localStorage.setItem(LS_BUDGET_KEY, JSON.stringify(testData));
    }
  }, []);

  // Sauvegarder le budget dans le localStorage
  useEffect(() => {
    try { localStorage.setItem(LS_BUDGET_KEY, JSON.stringify(budgetItems)); } catch {}
  }, [budgetItems]);

  const addTask = () => {
    const parsed = parseTaskNLP(input);
    if (!parsed.title) return;
    const t = { id: uuid(), title: parsed.title, priority: priorityChoice || parsed.priority, completed: false };
    setTasks(prev => [t, ...prev]);
    setInput("");
    setPriorityChoice("normal");
  };

  const completeTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    ding();
  };

  const removeTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  // Fonctions pour les notes
  const addNote = () => {
    if (!noteTitle.trim() && !noteContent.trim()) return;
    const newNote = {
      id: uuid(),
      title: noteTitle.trim() || "Note sans titre",
      content: noteContent.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    setNoteTitle("");
    setNoteContent("");
  };

  const updateNote = () => {
    if (!editingNote) return;
    const updatedNote = {
      ...editingNote,
      title: noteTitle.trim() || "Note sans titre",
      content: noteContent.trim(),
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => prev.map(note => note.id === editingNote.id ? updatedNote : note));
    setEditingNote(null);
    setNoteTitle("");
    setNoteContent("");
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (editingNote && editingNote.id === id) {
      setEditingNote(null);
      setNoteTitle("");
      setNoteContent("");
    }
  };

  const startEditNote = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setNoteTitle("");
    setNoteContent("");
  };

  // Filtrer les notes
  const filteredNotes = useMemo(() => {
    const q = noteFilter.q.toLowerCase();
    return notes.filter(note => 
      q ? 
        note.title.toLowerCase().includes(q) || 
        note.content.toLowerCase().includes(q) 
      : true
    );
  }, [notes, noteFilter]);

  // Fonctions pour les courses
  const addShoppingItem = () => {
    if (!itemName.trim()) return;
    const quantity = Math.max(1, itemQuantity || 1); // Assurer une quantité valide
    const newItem = {
      id: uuid(),
      name: itemName.trim(),
      quantity: quantity,
      unit: itemUnit,
      category: itemCategory,
      purchased: false,
      createdAt: new Date().toISOString()
    };
    setShoppingItems(prev => [newItem, ...prev]);
    setItemName("");
    setItemQuantity(1);
    setItemUnit("p");
    setItemCategory("courant");
  };

  const updateShoppingItem = () => {
    if (!editingItem) return;
    const quantity = Math.max(1, itemQuantity || 1); // Assurer une quantité valide
    const updatedItem = {
      ...editingItem,
      name: itemName.trim(),
      quantity: quantity,
      unit: itemUnit,
      category: itemCategory,
      updatedAt: new Date().toISOString()
    };
    setShoppingItems(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
    setEditingItem(null);
    setItemName("");
    setItemQuantity(1);
    setItemUnit("p");
    setItemCategory("courant");
  };

  const deleteShoppingItem = (id) => {
    setShoppingItems(prev => prev.filter(item => item.id !== id));
    if (editingItem && editingItem.id === id) {
      setEditingItem(null);
      setItemName("");
      setItemCategory("courant");
    }
  };

  const togglePurchased = (id) => {
    setShoppingItems(prev => prev.map(item => 
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
  };

  const startEditItem = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemQuantity(item.quantity);
    setItemUnit(item.unit);
    setItemCategory(item.category);
  };

  const cancelEditItem = () => {
    setEditingItem(null);
    setItemName("");
    setItemQuantity(1);
    setItemUnit("p");
    setItemCategory("courant");
  };

  // Filtrer les courses
  const filteredShoppingItems = useMemo(() => {
    let filtered = shoppingItems.filter(item => !item.purchased); // Ne montrer que les non achetés
    
    // Regrouper les articles identiques et cumuler les quantités
    const groupedItems = filtered.reduce((acc, item) => {
      const key = `${item.name}-${item.category}-${item.unit}`;
      if (acc[key]) {
        acc[key].quantity += item.quantity;
        // Garder la date de création la plus récente
        if (new Date(item.createdAt) > new Date(acc[key].createdAt)) {
          acc[key].createdAt = item.createdAt;
        }
      } else {
        acc[key] = { ...item };
      }
      return acc;
    }, {});
    
    // Convertir en tableau
    const groupedArray = Object.values(groupedItems);
    
    // Trier par catégorie (Courses courantes en premier) puis par date de création
    return groupedArray.sort((a, b) => {
      // Courses courantes en premier
      if (a.category === 'courant' && b.category === 'futur') return -1;
      if (a.category === 'futur' && b.category === 'courant') return 1;
      // Même catégorie : trier par date de création
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [shoppingItems]);

  // Fonctions pour le budget
  const addBudgetItem = () => {
    if (!budgetAmount) return;
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount)) return;
    
    const newItem = {
      id: uuid(),
      description: budgetDescription.trim() || BUDGET_CATEGORIES[budgetType][budgetCategory],
      amount: amount,
      type: budgetType,
      category: budgetCategory,
      date: budgetDate,
      createdAt: new Date().toISOString()
    };
    setBudgetItems(prev => [newItem, ...prev]);
    setBudgetDescription("");
    setBudgetAmount("");
    setBudgetDate(new Date().toISOString().split('T')[0]);
  };

  const updateBudgetItem = () => {
    if (!editingBudgetItem || !budgetAmount) return;
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount)) return;
    
    const updatedItem = {
      ...editingBudgetItem,
      description: budgetDescription.trim() || BUDGET_CATEGORIES[budgetType][budgetCategory],
      amount: amount,
      type: budgetType,
      category: budgetCategory,
      date: budgetDate,
      updatedAt: new Date().toISOString()
    };
    setBudgetItems(prev => prev.map(item => item.id === editingBudgetItem.id ? updatedItem : item));
    setEditingBudgetItem(null);
    setBudgetDescription("");
    setBudgetAmount("");
    setBudgetType("revenus");
    setBudgetCategory("salaire");
    setBudgetDate(new Date().toISOString().split('T')[0]);
  };

  const deleteBudgetItem = (id) => {
    setBudgetItems(prev => prev.filter(item => item.id !== id));
    if (editingBudgetItem && editingBudgetItem.id === id) {
      setEditingBudgetItem(null);
      setBudgetDescription("");
      setBudgetAmount("");
      setBudgetType("revenus");
      setBudgetCategory("salaire");
      setBudgetDate(new Date().toISOString().split('T')[0]);
    }
  };

  const startEditBudgetItem = (item) => {
    setEditingBudgetItem(item);
    setBudgetDescription(item.description);
    setBudgetAmount(item.amount.toString());
    setBudgetType(item.type);
    setBudgetCategory(item.category);
    setBudgetDate(item.date);
  };

  const cancelEditBudgetItem = () => {
    setEditingBudgetItem(null);
    setBudgetDescription("");
    setBudgetAmount("");
    setBudgetType("revenus");
    setBudgetCategory("salaire");
    setBudgetDate(new Date().toISOString().split('T')[0]);
  };

  // Mise à jour des catégories quand le type change
  const handleBudgetTypeChange = (newType) => {
    setBudgetType(newType);
    const firstCategory = Object.keys(BUDGET_CATEGORIES[newType])[0];
    setBudgetCategory(firstCategory);
  };

  const filtered = useMemo(() => {
    const q = filter.q.toLowerCase();
    return tasks
      .filter(t => (q ? t.title.toLowerCase().includes(q) : true))
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }, [tasks, filter]);

  const tasksByPriority = useMemo(() => {
    const q = filter.q.toLowerCase();
    const filteredTasks = tasks.filter(t => (q ? t.title.toLowerCase().includes(q) : true));
    
    return {
      urgent: filteredTasks.filter(t => t.priority === 'urgent'),
      normal: filteredTasks.filter(t => t.priority === 'normal'),
      low: filteredTasks.filter(t => t.priority === 'low')
    };
  }, [tasks, filter]);

  const PriorityBadge = ({ p }) => (
    <Badge className={`ml-2 rounded px-3 py-1 text-xs font-bold ${
      p === "urgent" ? "bg-red-600 text-white" : 
      p === "normal" ? "bg-orange-600 text-white" :
      "bg-gray-600 text-white"
    }`}>
      {PRIORITY_LABELS[p]}
    </Badge>
  );

  const TaskRow = ({ t }) => (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20, scale: 0.95 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 ${
        t.completed ? "opacity-60" : ""
      }`}
    >
      <div className="relative flex items-center gap-4 p-6">
        <Button 
          size="icon" 
          variant="outline" 
          onClick={() => completeTask(t.id)} 
          className="relative rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 group-hover:shadow-red-500/50"
        >
          <Check className="w-5 h-5 text-white" />
        </Button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <span className="font-semibold text-lg break-words leading-relaxed flex-1 text-gray-100 group-hover:text-white transition-colors duration-300 cursor-pointer">
              {t.title}
            </span>
            <PriorityBadge p={t.priority} />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-3">
      <div className="max-w-4xl mx-auto space-y-6 pt-8">
        {/* Titre principal avec logo */}
        <div className="text-center">
          <div className="flex flex-col items-center mb-6 space-y-4">
            <div>
              <LogoDevSwiss className="w-48 h-48 text-white" showText={false} />
            </div>
            <h1 className="text-7xl font-black tracking-tight uppercase" style={{ 
              fontFamily: '"Bebas Neue", "Arial Black", "Helvetica Neue", sans-serif',
              fontWeight: '900',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '2px 2px 0px rgba(220, 38, 38, 0.3)'
            }}>
              OPTIMA
            </h1>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex space-x-2 mb-12">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all duration-300 ${
              activeTab === "dashboard" 
                ? "bg-red-600 text-white shadow-lg" 
                : "text-gray-300 hover:text-white"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all duration-300 ${
              activeTab === "tasks" 
                ? "bg-red-600 text-white shadow-lg" 
                : "text-gray-300 hover:text-white"
            }`}
          >
            <List className="w-5 h-5" />
            Tâches
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all duration-300 ${
              activeTab === "notes" 
                ? "bg-red-600 text-white shadow-lg" 
                : "text-gray-300 hover:text-white"
            }`}
          >
            <FileText className="w-5 h-5" />
            Notes
          </button>
          <button
            onClick={() => setActiveTab("shopping")}
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all duration-300 ${
              activeTab === "shopping" 
                ? "bg-red-600 text-white shadow-lg" 
                : "text-gray-300 hover:text-white"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Courses
          </button>
          <button
            onClick={() => setActiveTab("budget")}
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all duration-300 ${
              activeTab === "budget" 
                ? "bg-red-600 text-white shadow-lg" 
                : "text-gray-300 hover:text-white"
            }`}
          >
            <Wallet className="w-5 h-5" />
            Budget
          </button>
        </div>

        {/* Section Dashboard Global */}
        {activeTab === "dashboard" && (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Titre et filtres */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Dashboard Global</h2>
                  <p className="text-gray-400">Vue d'ensemble de vos finances</p>
                </div>
                
                {/* Filtres */}
                <div className="flex flex-wrap gap-3">
                  {/* Filtre Année */}
                  <select 
                    value={dashboardFilter.year} 
                    onChange={(e) => setDashboardFilter(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-red-500 focus:ring-red-500"
                  >
                    {getAvailableYears(budgetItems).length > 0 ? getAvailableYears(budgetItems).map(year => (
                      <option key={year} value={year}>{year}</option>
                    )) : <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>}
                  </select>
                  
                  {/* Filtre Mois */}
                  <select 
                    value={dashboardFilter.month} 
                    onChange={(e) => setDashboardFilter(prev => ({ ...prev, month: e.target.value }))}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-red-500 focus:ring-red-500"
                  >
                    <option value="all">Toute l'année</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2024, i).toLocaleDateString('fr-FR', { month: 'long' })}
                      </option>
                    ))}
                  </select>

                  {/* Navigation vers budget avancé */}
                  <button
                    onClick={() => setActiveTab("budget-dashboard")}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Budget Avancé
                  </button>
                </div>
              </div>

              {budgetItems.length > 0 ? (
                <>
                  {/* Tableau de synthèse */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {Object.entries({
                      revenus: { label: 'Revenus', color: 'text-green-400' },
                      depenses_fixes: { label: 'Dépenses fixes', color: 'text-red-400' },
                      depenses_variables: { label: 'Dépenses variables', color: 'text-orange-400' },
                      epargne: { label: 'Épargne', color: 'text-blue-400' },
                      investissements: { label: 'Investissements', color: 'text-purple-400' }
                    }).map(([type, config]) => {
                      const total = budgetItems
                        .filter(item => {
                          const itemDate = new Date(item.date);
                          const yearMatch = itemDate.getFullYear() === dashboardFilter.year;
                          const monthMatch = dashboardFilter.month === 'all' || itemDate.getMonth() + 1 === parseInt(dashboardFilter.month);
                          return item.type === type && yearMatch && monthMatch;
                        })
                        .reduce((sum, item) => sum + parseFloat(item.amount), 0);

                      return (
                        <motion.div
                          key={type}
                          whileHover={{ scale: 1.02, y: -5 }}
                          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30"
                        >
                          <div className={`text-sm font-medium mb-2 ${config.color}`}>
                            {config.label}
                          </div>
                          <div className="text-white text-xl font-bold">
                            {type === 'revenus' || type === 'epargne' || type === 'investissements' ? '+' : '-'}{formatCurrency(total).replace(' CHF', '')} CHF
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Jauges de progression des objectifs */}
                  {(budgetLimits.longTerm.epargne > 0 || budgetLimits.longTerm.investissements > 0) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30"
                    >
                      <h3 className="text-xl font-bold text-white mb-4">Progression des objectifs</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Jauge Épargne */}
                        {budgetLimits.longTerm.epargne > 0 && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium">Objectif d'épargne</span>
                              <span className="text-sm text-gray-300">
                                {(() => {
                                  const totalSaved = budgetItems
                                    .filter(item => item.type === 'epargne')
                                    .reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                  return `${formatCurrency(totalSaved).replace(' CHF', '')} / ${formatCurrency(budgetLimits.longTerm.epargne).replace(' CHF', '')} CHF`;
                                })()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-4 shadow-inner">
                              <div 
                                className={`h-4 rounded-full transition-all duration-500 shadow-lg ${
                                  (() => {
                                    const totalSaved = budgetItems
                                      .filter(item => item.type === 'epargne')
                                      .reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                    const percentage = (totalSaved / budgetLimits.longTerm.epargne) * 100;
                                    return 'bg-gradient-to-r from-blue-400 to-blue-600';
                                  })()
                                }`}
                                style={{
                                  width: `${Math.min(100, (() => {
                                    const totalSaved = budgetItems
                                      .filter(item => item.type === 'epargne')
                                      .reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                    return (totalSaved / budgetLimits.longTerm.epargne) * 100;
                                  })())}%`
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {(() => {
                                const totalSaved = budgetItems
                                  .filter(item => item.type === 'epargne')
                                  .reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                const percentage = (totalSaved / budgetLimits.longTerm.epargne) * 100;
                                const remaining = budgetLimits.longTerm.epargne - totalSaved;
                                return percentage >= 100 ? 
                                  `🎉 Objectif atteint ! Dépassement de ${formatCurrency(Math.abs(remaining))}` :
                                  `${formatCurrency(remaining)} restants (${percentage.toFixed(1)}%)`;
                              })()}
                            </div>
                          </div>
                        )}
                        
                        {/* Jauge Investissements */}
                        {budgetLimits.longTerm.investissements > 0 && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium">Objectif d'investissement</span>
                              <span className="text-sm text-gray-300">
                                {(() => {
                                  const totalInvested = budgetItems
                                    .filter(item => item.type === 'investissements')
                                    .reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                  return `${formatCurrency(totalInvested).replace(' CHF', '')} / ${formatCurrency(budgetLimits.longTerm.investissements).replace(' CHF', '')} CHF`;
                                })()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-4 shadow-inner">
                              <div 
                                className={`h-4 rounded-full transition-all duration-500 shadow-lg ${
                                  (() => {
                                    const totalInvested = budgetItems
                                      .filter(item => item.type === 'investissements')
                                      .reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                    const percentage = (totalInvested / budgetLimits.longTerm.investissements) * 100;
                                    return 'bg-gradient-to-r from-blue-400 to-blue-600';
                                  })()
                                }`}
                                style={{
                                  width: `${Math.min(100, (() => {
                                    const totalInvested = budgetItems
                                      .filter(item => item.type === 'investissements')
                                      .reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                    return (totalInvested / budgetLimits.longTerm.investissements) * 100;
                                  })())}%`
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {(() => {
                                const totalInvested = budgetItems
                                  .filter(item => item.type === 'investissements')
                                  .reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                const percentage = (totalInvested / budgetLimits.longTerm.investissements) * 100;
                                const remaining = budgetLimits.longTerm.investissements - totalInvested;
                                return percentage >= 100 ? 
                                  `🚀 Objectif atteint ! Dépassement de ${formatCurrency(Math.abs(remaining))}` :
                                  `${formatCurrency(remaining)} restants (${percentage.toFixed(1)}%)`;
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Graphiques mensuels */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Graphique en barres mensuelles */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30"
                    >
                      <h3 className="text-xl font-bold text-white mb-4">Évolution mensuelle {dashboardFilter.year}</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={processMonthlyData(budgetItems, dashboardFilter.year)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1f2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                            formatter={(value) => [`${formatCurrency(value)}`, '']}
                          />
                          <Legend />
                          <Bar dataKey="revenus" fill={colors.revenus} name="Revenus" />
                          <Bar dataKey="depenses_fixes" fill={colors.depenses_fixes} name="Dépenses fixes" />
                          <Bar dataKey="depenses_variables" fill={colors.depenses_variables} name="Dépenses variables" />
                          <Bar dataKey="epargne" fill={colors.epargne} name="Épargne" />
                          <Bar dataKey="investissements" fill={colors.investissements} name="Investissements" />
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>

                    {/* Graphique camembert répartition annuelle */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30"
                    >
                      <h3 className="text-xl font-bold text-white mb-4">Répartition {dashboardFilter.month === 'all' ? dashboardFilter.year : `${new Date(dashboardFilter.year, dashboardFilter.month - 1).toLocaleDateString('fr-FR', { month: 'long' })} ${dashboardFilter.year}`}</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { 
                                name: 'Revenus', 
                                value: budgetItems.filter(item => {
                                  const itemDate = new Date(item.date);
                                  const yearMatch = itemDate.getFullYear() === dashboardFilter.year;
                                  const monthMatch = dashboardFilter.month === 'all' || itemDate.getMonth() + 1 === parseInt(dashboardFilter.month);
                                  return item.type === 'revenus' && yearMatch && monthMatch;
                                }).reduce((sum, item) => sum + parseFloat(item.amount), 0),
                                fill: colors.revenus
                              },
                              { 
                                name: 'Dépenses fixes', 
                                value: budgetItems.filter(item => {
                                  const itemDate = new Date(item.date);
                                  const yearMatch = itemDate.getFullYear() === dashboardFilter.year;
                                  const monthMatch = dashboardFilter.month === 'all' || itemDate.getMonth() + 1 === parseInt(dashboardFilter.month);
                                  return item.type === 'depenses_fixes' && yearMatch && monthMatch;
                                }).reduce((sum, item) => sum + parseFloat(item.amount), 0),
                                fill: colors.depenses_fixes
                              },
                              { 
                                name: 'Dépenses variables', 
                                value: budgetItems.filter(item => {
                                  const itemDate = new Date(item.date);
                                  const yearMatch = itemDate.getFullYear() === dashboardFilter.year;
                                  const monthMatch = dashboardFilter.month === 'all' || itemDate.getMonth() + 1 === parseInt(dashboardFilter.month);
                                  return item.type === 'depenses_variables' && yearMatch && monthMatch;
                                }).reduce((sum, item) => sum + parseFloat(item.amount), 0),
                                fill: colors.depenses_variables
                              },
                              { 
                                name: 'Épargne', 
                                value: budgetItems.filter(item => {
                                  const itemDate = new Date(item.date);
                                  const yearMatch = itemDate.getFullYear() === dashboardFilter.year;
                                  const monthMatch = dashboardFilter.month === 'all' || itemDate.getMonth() + 1 === parseInt(dashboardFilter.month);
                                  return item.type === 'epargne' && yearMatch && monthMatch;
                                }).reduce((sum, item) => sum + parseFloat(item.amount), 0),
                                fill: colors.epargne
                              },
                              { 
                                name: 'Investissements', 
                                value: budgetItems.filter(item => {
                                  const itemDate = new Date(item.date);
                                  const yearMatch = itemDate.getFullYear() === dashboardFilter.year;
                                  const monthMatch = dashboardFilter.month === 'all' || itemDate.getMonth() + 1 === parseInt(dashboardFilter.month);
                                  return item.type === 'investissements' && yearMatch && monthMatch;
                                }).reduce((sum, item) => sum + parseFloat(item.amount), 0),
                                fill: colors.investissements
                              }
                            ].filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1f2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                            formatter={(value, name) => [`${formatCurrency(value)}`, name]}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            wrapperStyle={{ color: '#fff', fontSize: '14px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </div>

                  {/* Graphiques annuels */}
                  {getAvailableYears(budgetItems).length > 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Aucune donnée financière disponible</p>
                  <p className="text-gray-500 text-sm mt-2">Commencez par ajouter des opérations dans l'onglet Budget</p>
                  <button
                    onClick={() => setActiveTab("budget")}
                    className="mt-4 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                  >
                    Aller au Budget
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* Section Budget Avancé */}
        {activeTab === "budget-dashboard" && (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Header avec navigation et tabs */}
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    {/* Bouton retour */}
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Retour au Dashboard
                    </button>
                    <div className="h-6 w-px bg-gray-600"></div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Budget Avancé</h2>
                      <p className="text-gray-400">Analyses approfondies de vos finances</p>
                    </div>
                  </div>
                  
                </div>

                {/* Navigation tabs */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setBudgetDashboardView("monthly")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      budgetDashboardView === "monthly" 
                        ? "bg-red-600 text-white shadow-lg" 
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Mensuel
                  </button>
                  <button
                    onClick={() => setBudgetDashboardView("categories")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      budgetDashboardView === "categories" 
                        ? "bg-red-600 text-white shadow-lg" 
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <PieChartIcon className="w-4 h-4" />
                    Catégories
                  </button>
                  <button
                    onClick={() => setBudgetDashboardView("comparative")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      budgetDashboardView === "comparative" 
                        ? "bg-red-600 text-white shadow-lg" 
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Comparatif
                  </button>
                  <button
                    onClick={() => setBudgetDashboardView("table")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      budgetDashboardView === "table" 
                        ? "bg-red-600 text-white shadow-lg" 
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <Table className="w-4 h-4" />
                    Tableau
                  </button>
                </div>
              </div>

              {budgetItems.length > 0 ? (
                <>
                  {/* Vue Mensuelle */}
                  {budgetDashboardView === "monthly" && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Filtre année pour vue mensuelle */}
                      <div className="flex justify-end">
                        <select 
                          value={monthlyViewYear} 
                          onChange={(e) => setMonthlyViewYear(parseInt(e.target.value))}
                          className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-red-500"
                        >
                          {Array.from(new Set(budgetItems.map(item => new Date(item.date).getFullYear()))).sort((a, b) => b - a).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Graphique barres empilées mensuelles */}
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                          <h3 className="text-xl font-bold text-white mb-4">Revenus vs Dépenses par mois</h3>
                          <ResponsiveContainer width="100%" height={500}>
                            <BarChart data={processMonthlyData(budgetItems, monthlyViewYear)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="name" stroke="#9ca3af" />
                              <YAxis stroke="#9ca3af" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1f2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px',
                                  color: '#fff'
                                }}
                                formatter={(value) => [`${formatCurrency(value)}`, '']}
                              />
                              <Legend />
                              <Bar dataKey="revenus" stackId="a" fill={colors.revenus} name="Revenus" />
                              <Bar dataKey="depenses_fixes" stackId="b" fill={colors.depenses_fixes} name="Dépenses fixes" />
                              <Bar dataKey="depenses_variables" stackId="b" fill={colors.depenses_variables} name="Dépenses variables" />
                              <Bar dataKey="epargne" stackId="b" fill={colors.epargne} name="Épargne" />
                              <Bar dataKey="investissements" stackId="b" fill={colors.investissements} name="Investissements" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Courbe du solde mensuel */}
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                          <h3 className="text-xl font-bold text-white mb-4">Évolution du solde mensuel</h3>
                          <ResponsiveContainer width="100%" height={500}>
                            <LineChart data={processMonthlyData(budgetItems, monthlyViewYear)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="name" stroke="#9ca3af" />
                              <YAxis stroke="#9ca3af" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1f2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px',
                                  color: '#fff'
                                }}
                                formatter={(value) => [formatCurrency(value), 'Solde']}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="solde" 
                                stroke="#ef4444" 
                                strokeWidth={3}
                                dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                                activeDot={{ r: 7, stroke: '#ef4444', strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Vue Catégories - 5 Blocs séparés */}
                  {budgetDashboardView === "categories" && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Filtre année pour vue catégories */}
                      <div className="flex justify-end">
                        <select 
                          value={categoriesViewYear} 
                          onChange={(e) => setCategoriesViewYear(parseInt(e.target.value))}
                          className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-red-500"
                        >
                          {Array.from(new Set(budgetItems.map(item => new Date(item.date).getFullYear()))).sort((a, b) => b - a).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* BLOC 1: Liste exhaustive des dépenses */}
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                        <h3 className="text-xl font-bold text-white mb-4">Dépenses {categoriesViewYear}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                          {processCategoriesData(budgetItems, categoriesViewYear)
                            .filter(entry => entry.value < 0) // Seulement les dépenses (valeurs négatives)
                            .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
                            .map((entry, index) => (
                            <div 
                              key={`expense-category-${index}`} 
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 hover:bg-gray-600/30 transition-colors border-l-4"
                              style={{ borderLeftColor: entry.fill }}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div 
                                  className="w-5 h-5 rounded-full flex-shrink-0 border-2 border-gray-600"
                                  style={{ backgroundColor: entry.fill }}
                                ></div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-white text-sm truncate">
                                    {entry.name}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {entry.type === 'depenses_fixes' ? 'Dépense fixe' : 'Dépense variable'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div 
                                  className="font-bold text-sm"
                                  style={{ color: entry.fill }}
                                >
                                  {formatCurrency(Math.abs(entry.value))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 p-3 bg-gray-700/20 rounded-lg border border-gray-600/30">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-300">Total dépenses :</span>
                            <span className="font-bold text-red-400">
                              {formatCurrency(processCategoriesData(budgetItems, categoriesViewYear)
                                .filter(entry => entry.value < 0)
                                .reduce((sum, entry) => sum + Math.abs(entry.value), 0))}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-400">Nombre de catégories :</span>
                            <span className="text-xs text-gray-300">
                              {processCategoriesData(budgetItems, categoriesViewYear)
                                .filter(entry => entry.value < 0).length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* BLOC 2: Camembert global */}
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                        <h3 className="text-xl font-bold text-white mb-4">Vue d'ensemble - Toutes catégories</h3>
                        <div className="w-full flex justify-center">
                          <ResponsiveContainer width="100%" height={500} minWidth={300}>
                            <PieChart>
                              <Pie
                                data={processCategoriesData(budgetItems, categoriesViewYear)
                                  .filter(entry => entry.value < 0) // Seulement les dépenses
                                  .map(entry => ({...entry, value: Math.abs(entry.value)}))} // Convertir en positif pour l'affichage
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={200}
                                innerRadius={80}
                                paddingAngle={2}
                                label={({ name, percent }) => 
                                  `${name} ${(percent * 100).toFixed(1)}%`
                                }
                                labelLine={true}
                                style={{
                                  fontSize: '12px',
                                  fontWeight: '500'
                                }}
                              >
                                {processCategoriesData(budgetItems, categoriesViewYear)
                                  .filter(entry => entry.value < 0)
                                  .map((entry, index) => (
                                  <Cell 
                                    key={`global-expense-cell-${index}`} 
                                    fill={entry.fill}
                                    stroke="#1f2937"
                                    strokeWidth={2}
                                  />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1f2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px',
                                  color: '#fff',
                                  fontSize: '14px'
                                }}
                                formatter={(value, name) => [
                                  formatCurrency(value),
                                  name
                                ]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* BLOC 3: Graphique barres par catégorie */}
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                        <h3 className="text-xl font-bold text-white mb-4">Barres par catégorie</h3>
                        <ResponsiveContainer width="100%" height={600}>
                          <BarChart
                            data={processCategoriesData(budgetItems, categoriesViewYear)
                              .filter(entry => entry.value < 0) // Seulement les dépenses
                              .map(entry => ({...entry, value: Math.abs(entry.value)})) // Convertir en positif
                              .sort((a, b) => b.value - a.value)} // Trier par montant décroissant
                            layout="horizontal"
                            margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              type="category" 
                              dataKey="name"
                              stroke="#9ca3af" 
                              tick={{ 
                                fontSize: 11,
                                angle: -45,
                                textAnchor: 'end',
                                height: 100
                              }}
                              height={100}
                              interval={0}
                            />
                            <YAxis 
                              type="number"
                              stroke="#9ca3af" 
                              tickFormatter={(value) => formatCurrency(value)}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1f2937', 
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#fff'
                              }}
                              formatter={(value, name, props) => [
                                formatCurrency(value),
                                props.payload.name
                              ]}
                            />
                            <Bar 
                              dataKey="value" 
                              radius={[0, 4, 4, 0]}
                            >
                              {processCategoriesData(budgetItems, categoriesViewYear)
                                .filter(entry => entry.value < 0)
                                .map(entry => ({...entry, value: Math.abs(entry.value)}))
                                .sort((a, b) => b.value - a.value)
                                .map((entry, index) => (
                                <Cell key={`bar-cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* BLOC 4: Liste des investissements */}
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                        <h3 className="text-xl font-bold text-white mb-4">Investissements {categoriesViewYear}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                          {processCategoriesData(budgetItems, categoriesViewYear)
                            .filter(entry => entry.type === 'epargne' || entry.type === 'investissements') // Seulement épargne et investissements
                            .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
                            .map((entry, index) => (
                            <div 
                              key={`investment-category-${index}`} 
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 hover:bg-gray-600/30 transition-colors border-l-4"
                              style={{ borderLeftColor: entry.fill }}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div 
                                  className="w-5 h-5 rounded-full flex-shrink-0 border-2 border-gray-600"
                                  style={{ backgroundColor: entry.fill }}
                                ></div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-white text-sm truncate">
                                    {entry.name}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {entry.type === 'epargne' ? 'Épargne' : 'Investissement'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div 
                                  className="font-bold text-sm"
                                  style={{ color: entry.fill }}
                                >
                                  {formatCurrency(Math.abs(entry.value))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 p-3 bg-gray-700/20 rounded-lg border border-gray-600/30">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-300">Total investissements :</span>
                            <span className="font-bold text-green-400">
                              {formatCurrency(processCategoriesData(budgetItems, categoriesViewYear)
                                .filter(entry => entry.type === 'epargne' || entry.type === 'investissements')
                                .reduce((sum, entry) => sum + Math.abs(entry.value), 0))}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-400">Nombre de catégories :</span>
                            <span className="text-xs text-gray-300">
                              {processCategoriesData(budgetItems, categoriesViewYear)
                                .filter(entry => entry.type === 'epargne' || entry.type === 'investissements').length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* BLOC 5: Camembert Investissements/Épargne */}
                      <div className="bg-gradient-to-br from-blue-900/30 to-green-900/30 backdrop-blur-sm rounded-xl p-6 border border-blue-700/30">
                        <h3 className="text-xl font-bold text-white mb-4">Investissements & Épargne</h3>
                        <div className="w-full flex justify-center">
                          <ResponsiveContainer width="100%" height={450} minWidth={300}>
                            <PieChart>
                              <Pie
                                data={processCategoriesData(budgetItems, categoriesViewYear)
                                  .filter(item => item.type === 'epargne' || item.type === 'investissements')}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={160}
                                innerRadius={60}
                                paddingAngle={3}
                                label={({ name, percent }) => 
                                  `${name} ${(percent * 100).toFixed(1)}%`
                                }
                                labelLine={true}
                                style={{
                                  fontSize: '12px',
                                  fontWeight: '500'
                                }}
                              >
                                {processCategoriesData(budgetItems, categoriesViewYear)
                                  .filter(item => item.type === 'epargne' || item.type === 'investissements')
                                  .map((entry, index) => (
                                  <Cell 
                                    key={`investment-cell-${index}`} 
                                    fill={entry.fill}
                                    stroke="#1e3a8a"
                                    strokeWidth={2}
                                  />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1e3a8a', 
                                  border: '1px solid #3b82f6',
                                  borderRadius: '8px',
                                  color: '#fff',
                                  fontSize: '14px'
                                }}
                                formatter={(value, name) => [`${formatCurrency(value)}`, name]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Vue Comparative */}
                  {budgetDashboardView === "comparative" && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Sélecteur de périodes et granularité */}
                      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-white">Choisir les périodes à comparer</h3>
                          
                          {/* Sélecteur de granularité */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-400">Vue:</span>
                            <select 
                              value={compareGranularity} 
                              onChange={(e) => setCompareGranularity(e.target.value)}
                              className="bg-gray-700 text-white px-3 py-1 rounded-lg border border-gray-600 focus:border-red-500 text-sm"
                            >
                              <option value="types">Types</option>
                              <option value="categories">Catégories détaillées</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                          
                          {/* Période 1 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Première période</label>
                            <div className="space-y-2">
                              <select 
                                value={compareConfig.period1.year} 
                                onChange={(e) => setCompareConfig(prev => ({ 
                                  ...prev, 
                                  period1: { ...prev.period1, year: parseInt(e.target.value) }
                                }))}
                                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500"
                              >
                                <option value={2024}>2024</option>
                                <option value={2025}>2025</option>
                              </select>
                              <select 
                                value={compareConfig.period1.month || compareConfig.period1.quarter || ''} 
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value.startsWith('Q')) {
                                    // Trimestre
                                    setCompareConfig(prev => ({ 
                                      ...prev, 
                                      period1: { ...prev.period1, month: null, quarter: value }
                                    }));
                                  } else if (value === '') {
                                    // Toute l'année
                                    setCompareConfig(prev => ({ 
                                      ...prev, 
                                      period1: { ...prev.period1, month: null, quarter: null }
                                    }));
                                  } else {
                                    // Mois
                                    setCompareConfig(prev => ({ 
                                      ...prev, 
                                      period1: { ...prev.period1, month: parseInt(value), quarter: null }
                                    }));
                                  }
                                }}
                                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500"
                              >
                                <option value="">Toute l'année</option>
                                <optgroup label="Trimestres">
                                  <option value="Q1">Q1 - Janv, Févr, Mars</option>
                                  <option value="Q2">Q2 - Avril, Mai, Juin</option>
                                  <option value="Q3">Q3 - Juil, Août, Sept</option>
                                  <option value="Q4">Q4 - Oct, Nov, Déc</option>
                                </optgroup>
                                <optgroup label="Mois">
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                      {new Date(2024, i).toLocaleDateString('fr-FR', { month: 'long' })}
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                            </div>
                          </div>

                          {/* VS */}
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                              VS
                            </div>
                          </div>

                          {/* Période 2 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Deuxième période</label>
                            <div className="space-y-2">
                              <select 
                                value={compareConfig.period2.year} 
                                onChange={(e) => setCompareConfig(prev => ({ 
                                  ...prev, 
                                  period2: { ...prev.period2, year: parseInt(e.target.value) }
                                }))}
                                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-orange-500"
                              >
                                <option value={2024}>2024</option>
                                <option value={2025}>2025</option>
                              </select>
                              <select 
                                value={compareConfig.period2.month || compareConfig.period2.quarter || ''} 
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value.startsWith('Q')) {
                                    // Trimestre
                                    setCompareConfig(prev => ({ 
                                      ...prev, 
                                      period2: { ...prev.period2, month: null, quarter: value }
                                    }));
                                  } else if (value === '') {
                                    // Toute l'année
                                    setCompareConfig(prev => ({ 
                                      ...prev, 
                                      period2: { ...prev.period2, month: null, quarter: null }
                                    }));
                                  } else {
                                    // Mois
                                    setCompareConfig(prev => ({ 
                                      ...prev, 
                                      period2: { ...prev.period2, month: parseInt(value), quarter: null }
                                    }));
                                  }
                                }}
                                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-orange-500"
                              >
                                <option value="">Toute l'année</option>
                                <optgroup label="Trimestres">
                                  <option value="Q1">Q1 - Janv, Févr, Mars</option>
                                  <option value="Q2">Q2 - Avril, Mai, Juin</option>
                                  <option value="Q3">Q3 - Juil, Août, Sept</option>
                                  <option value="Q4">Q4 - Oct, Nov, Déc</option>
                                </optgroup>
                                <optgroup label="Mois">
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                      {new Date(2024, i).toLocaleDateString('fr-FR', { month: 'long' })}
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Graphique de comparaison ultra-clair */}
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-white mb-2">Comparaison simple</h3>
                          <div className="flex items-center justify-center gap-4 text-lg">
                            <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg font-bold">
                              {formatPeriodName(compareConfig.period1)}
                            </span>
                            <span className="text-white font-bold">VS</span>
                            <span className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg font-bold">
                              {formatPeriodName(compareConfig.period2)}
                            </span>
                          </div>
                        </div>
                        
                        <ResponsiveContainer width="100%" height={500}>
                          <BarChart 
                            data={(() => {
                              const compData = getComparativeData(
                                budgetItems, 
                                compareConfig.period1, 
                                compareConfig.period2, 
                                compareGranularity
                              );
                              
                              const result = [];
                              
                              if (compData.isDetailed) {
                                // Mode catégories détaillées
                                Object.keys(compData.period1).forEach(category => {
                                  result.push({
                                    category,
                                    periode1: compData.period1[category], 
                                    periode2: compData.period2[category]
                                  });
                                });
                              } else {
                                // Mode types
                                result.push(
                                  {
                                    category: 'Revenus',
                                    periode1: compData.period1.revenus,
                                    periode2: compData.period2.revenus
                                  },
                                  {
                                    category: 'Dépenses fixes',
                                    periode1: compData.period1.depenses_fixes,
                                    periode2: compData.period2.depenses_fixes
                                  },
                                  {
                                    category: 'Dépenses variables',
                                    periode1: compData.period1.depenses_variables,
                                    periode2: compData.period2.depenses_variables
                                  },
                                  {
                                    category: 'Épargne',
                                    periode1: compData.period1.epargne,
                                    periode2: compData.period2.epargne
                                  },
                                  {
                                    category: 'Investissements',
                                    periode1: compData.period1.investissements,
                                    periode2: compData.period2.investissements
                                  }
                                );
                              }
                              
                              return result;
                            })()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="category"
                              stroke="#9ca3af"
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis 
                              stroke="#9ca3af"
                              tickFormatter={(value) => formatCurrency(value)}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1f2937', 
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px'
                              }}
                              formatter={(value, name) => [
                                formatCurrency(value),
                                name.includes('periode1') ? 'Période 1' : 'Période 2'
                              ]}
                            />
                            <Legend 
                              wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }}
                            />
                            <Bar 
                              dataKey="periode1" 
                              fill="#3b82f6"
                              name="Période 1 (Bleue)"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                              dataKey="periode2" 
                              fill="#f97316"
                              name="Période 2 (Orange)"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                        
                        {/* Résumé simple des évolutions */}
                        <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
                          <h4 className="text-lg font-bold text-white mb-4 text-center">Qu'est-ce qui a changé ?</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(() => {
                              const compData = getComparativeData(
                                budgetItems, 
                                compareConfig.period1, 
                                compareConfig.period2, 
                                compareGranularity
                              );
                              
                              if (!compData.isDetailed) {
                                const categories = [
                                  { name: 'Revenus', key: 'revenus', icon: '💰', isGood: true },
                                  { name: 'Dépenses fixes', key: 'depenses_fixes', icon: '🏠', isGood: false },
                                  { name: 'Dépenses variables', key: 'depenses_variables', icon: '🛒', isGood: false },
                                  { name: 'Épargne', key: 'epargne', icon: '🏦', isGood: true },
                                  { name: 'Investissements', key: 'investissements', icon: '📈', isGood: true }
                                ];
                                
                                return categories.map((cat, index) => {
                                  const value1 = compData.period1[cat.key];
                                  const value2 = compData.period2[cat.key];
                                  const diff = value2 - value1;
                                  
                                  if (Math.abs(diff) < 10) return null; // Ne pas afficher si différence trop petite
                                  
                                  const isImprovement = cat.isGood ? diff > 0 : diff < 0;
                                  
                                  return (
                                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                                      isImprovement ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'
                                    }`}>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{cat.icon}</span>
                                        <span className="text-white font-medium">{cat.name}</span>
                                      </div>
                                      <div className="text-sm text-gray-300">
                                        {formatCurrency(value1).replace(' CHF', '')} → {formatCurrency(value2).replace(' CHF', '')} CHF
                                      </div>
                                      <div className={`text-lg font-bold ${
                                        isImprovement ? 'text-green-400' : 'text-red-400'
                                      }`}>
                                        {diff > 0 ? '+' : ''}{formatCurrency(Math.abs(diff)).replace(' CHF', '')} CHF
                                        <span className="text-sm ml-1">
                                          {isImprovement ? '✓' : '✗'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                }).filter(Boolean);
                              } else {
                                // Mode détaillé - afficher top 3 des plus grandes différences
                                const diffs = [];
                                Object.keys(compData.period1).forEach(category => {
                                  const value1 = compData.period1[category];
                                  const value2 = compData.period2[category];
                                  const diff = value2 - value1;
                                  if (Math.abs(diff) >= 10) {
                                    diffs.push({ name: category, value1, value2, diff });
                                  }
                                });
                                
                                return diffs
                                  .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
                                  .slice(0, 6)
                                  .map((item, index) => {
                                    const isReduction = item.diff < 0;
                                    
                                    return (
                                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                                        isReduction ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'
                                      }`}>
                                        <div className="text-white font-medium mb-1">{item.name}</div>
                                        <div className="text-sm text-gray-300">
                                          {formatCurrency(item.value1).replace(' CHF', '')} → {formatCurrency(item.value2).replace(' CHF', '')} CHF
                                        </div>
                                        <div className={`text-lg font-bold ${
                                          isReduction ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                          {item.diff > 0 ? '+' : ''}{formatCurrency(Math.abs(item.diff)).replace(' CHF', '')} CHF
                                          <span className="text-sm ml-1">
                                            {isReduction ? '✓' : '✗'}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  });
                              }
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Tableau comparatif détaillé */}
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                        <h3 className="text-xl font-bold text-white mb-6 text-center">Tableau comparatif détaillé</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-white">
                            <thead>
                              <tr className="border-b border-gray-600">
                                <th className="text-left py-3 px-4 font-bold">Catégorie</th>
                                <th className="text-right py-3 px-4 font-bold text-blue-400">
                                  {formatPeriodName(compareConfig.period1)}
                                </th>
                                <th className="text-right py-3 px-4 font-bold text-orange-400">
                                  {formatPeriodName(compareConfig.period2)}
                                </th>
                                <th className="text-right py-3 px-4 font-bold">Différence (P2 − P1)</th>
                                <th className="text-right py-3 px-4 font-bold">Variation %</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const compData = getComparativeData(
                                  budgetItems, 
                                  compareConfig.period1, 
                                  compareConfig.period2, 
                                  compareGranularity
                                );
                                
                                const rows = [];
                                
                                if (compData.isDetailed) {
                                  // Mode catégories détaillées
                                  Object.keys(compData.period1).forEach(categoryName => {
                                    const value1 = compData.period1[categoryName]; // P1
                                    const value2 = compData.period2[categoryName]; // P2
                                    const difference = value2 - value1; // P2 - P1
                                    const percentage = value1 === 0 ? 'N/A' : (((value2 - value1) / value1) * 100);
                                    
                                    // Pour les catégories détaillées, on assume que toute réduction est bonne (dépenses)
                                    const isDiffGood = difference < 0;
                                    
                                    rows.push({
                                      name: categoryName,
                                      value1,
                                      value2,
                                      difference,
                                      percentage,
                                      isDiffGood
                                    });
                                  });
                                } else {
                                  // Mode types
                                  const categories = [
                                    { name: 'Revenus', key: 'revenus' },
                                    { name: 'Dépenses fixes', key: 'depenses_fixes' },
                                    { name: 'Dépenses variables', key: 'depenses_variables' },
                                    { name: 'Épargne', key: 'epargne' },
                                    { name: 'Investissements', key: 'investissements' }
                                  ];
                                  
                                  categories.forEach(category => {
                                    const value1 = compData.period1[category.key]; // P1
                                    const value2 = compData.period2[category.key]; // P2
                                    const difference = value2 - value1; // P2 - P1
                                    const percentage = value1 === 0 ? 'N/A' : (((value2 - value1) / value1) * 100);
                                    
                                    // Logique couleur selon type
                                    let isDiffGood;
                                    if (category.key === 'revenus' || category.key === 'epargne' || category.key === 'investissements') {
                                      isDiffGood = difference > 0; // Plus = mieux pour revenus/épargne/invest
                                    } else {
                                      isDiffGood = difference < 0; // Moins = mieux pour dépenses
                                    }
                                    
                                    rows.push({
                                      name: category.name,
                                      value1,
                                      value2,
                                      difference,
                                      percentage,
                                      isDiffGood
                                    });
                                  });
                                }
                                
                                // Trier par différence absolue décroissante
                                rows.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
                                
                                return rows.map((row, index) => (
                                  <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                                    <td className="py-3 px-4 font-medium">{row.name}</td>
                                    <td className="text-right py-3 px-4 text-blue-400 font-medium">
                                      {formatCurrency(row.value1)}
                                    </td>
                                    <td className="text-right py-3 px-4 text-orange-400 font-medium">
                                      {formatCurrency(row.value2)}
                                    </td>
                                    <td className={`text-right py-3 px-4 font-bold ${
                                      row.isDiffGood ? 'text-green-400' : 
                                      row.difference === 0 ? 'text-gray-400' : 'text-red-400'
                                    }`}>
                                      {row.difference > 0 ? '+' : ''}{formatCurrency(Math.abs(row.difference)).replace(' CHF', '')} CHF
                                    </td>
                                    <td className={`text-right py-3 px-4 font-bold ${
                                      row.percentage === 'N/A' ? 'text-gray-400' :
                                      row.isDiffGood ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                      {row.percentage === 'N/A' ? 'N/A' : 
                                        (row.percentage > 0 ? '+' : '') + row.percentage.toFixed(1) + '%'
                                      }
                                    </td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Résumé visuel amélioré avec pourcentages */}
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                        <h3 className="text-xl font-bold text-white mb-6 text-center">Synthèse comparative</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {(() => {
                            const compData = comparePeriodsData(
                              budgetItems, 
                              compareConfig.period1, 
                              compareConfig.period2, 
                              compareConfig.period1.month && compareConfig.period2.month ? 'months' : 'years'
                            );
                            
                            const revenueDiff = compData.period1.revenus - compData.period2.revenus;
                            const revenuePercent = compData.period2.revenus !== 0 ? (revenueDiff / Math.abs(compData.period2.revenus)) * 100 : 0;
                            
                            const depensesDiff = (compData.period1.depenses_fixes + compData.period1.depenses_variables) - (compData.period2.depenses_fixes + compData.period2.depenses_variables);
                            const depensesTotal2 = compData.period2.depenses_fixes + compData.period2.depenses_variables;
                            const depensesPercent = depensesTotal2 !== 0 ? (depensesDiff / Math.abs(depensesTotal2)) * 100 : 0;
                            
                            const epargneDiff = (compData.period1.epargne + compData.period1.investissements) - (compData.period2.epargne + compData.period2.investissements);
                            const epargneTotal2 = compData.period2.epargne + compData.period2.investissements;
                            const epargnePercent = epargneTotal2 !== 0 ? (epargneDiff / Math.abs(epargneTotal2)) * 100 : 0;
                            
                            const soldeDiff = (compData.period1.revenus - (compData.period1.depenses_fixes + compData.period1.depenses_variables)) - 
                                            (compData.period2.revenus - (compData.period2.depenses_fixes + compData.period2.depenses_variables));
                            const solde1 = compData.period1.revenus - (compData.period1.depenses_fixes + compData.period1.depenses_variables);
                            const solde2 = compData.period2.revenus - (compData.period2.depenses_fixes + compData.period2.depenses_variables);
                            const soldePercent = Math.abs(solde2) !== 0 ? (soldeDiff / Math.abs(solde2)) * 100 : 0;
                            
                            return (
                              <>
                                {/* Colonnes principales */}
                                <div className="space-y-4">
                                  <h4 className="text-lg font-bold text-white mb-4 border-b border-gray-600 pb-2">Évolutions financières</h4>
                                  
                                  {/* Revenus */}
                                  <div className={`p-4 rounded-lg ${revenueDiff >= 0 ? 'bg-green-500/20 border-l-4 border-green-500' : 'bg-red-500/20 border-l-4 border-red-500'}`}>
                                    <div className="flex justify-between items-center">
                                      <span className="text-white font-medium">Revenus</span>
                                      <div className="text-right">
                                        <div className={`font-black ${revenueDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          {revenueDiff > 0 ? '+' : ''}{formatCurrency(Math.abs(revenueDiff)).replace(' CHF', '')} CHF
                                        </div>
                                        <div className={`text-sm ${revenueDiff >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                          {revenuePercent > 0 ? '+' : ''}{revenuePercent.toFixed(1)}%
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Dépenses */}
                                  <div className={`p-4 rounded-lg ${depensesDiff <= 0 ? 'bg-green-500/20 border-l-4 border-green-500' : 'bg-red-500/20 border-l-4 border-red-500'}`}>
                                    <div className="flex justify-between items-center">
                                      <span className="text-white font-medium">Dépenses totales</span>
                                      <div className="text-right">
                                        <div className={`font-black ${depensesDiff <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          {depensesDiff > 0 ? '+' : ''}{formatCurrency(Math.abs(depensesDiff)).replace(' CHF', '')} CHF
                                        </div>
                                        <div className={`text-sm ${depensesDiff <= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                          {depensesDiff <= 0 ? 'Économie ' : 'Hausse '}
                                          {Math.abs(depensesPercent).toFixed(1)}%
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Épargne */}
                                  <div className={`p-4 rounded-lg ${epargneDiff >= 0 ? 'bg-green-500/20 border-l-4 border-green-500' : 'bg-red-500/20 border-l-4 border-red-500'}`}>
                                    <div className="flex justify-between items-center">
                                      <span className="text-white font-medium">Épargne & Investissements</span>
                                      <div className="text-right">
                                        <div className={`font-black ${epargneDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          {epargneDiff > 0 ? '+' : ''}{formatCurrency(Math.abs(epargneDiff)).replace(' CHF', '')} CHF
                                        </div>
                                        <div className={`text-sm ${epargneDiff >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                          {epargnePercent > 0 ? '+' : ''}{epargnePercent.toFixed(1)}%
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Solde et résumé global */}
                                <div className="space-y-4">
                                  <h4 className="text-lg font-bold text-white mb-4 border-b border-gray-600 pb-2">Bilan global</h4>
                                  
                                  {/* Solde net */}
                                  <div className={`p-6 rounded-xl text-center ${soldeDiff >= 0 ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                                    <div className="text-white text-sm mb-2">Solde net (Revenus - Dépenses)</div>
                                    <div className={`text-3xl font-black mb-1 ${soldeDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {soldeDiff > 0 ? '+' : ''}{formatCurrency(Math.abs(soldeDiff)).replace(' CHF', '')} CHF
                                    </div>
                                    <div className={`text-sm ${soldeDiff >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                      {Math.abs(soldePercent).toFixed(1)}% vs période précédente
                                    </div>
                                    <div className={`text-xs font-bold mt-2 ${soldeDiff >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                      {soldeDiff >= 0 ? 'SITUATION AMÉLIORÉE' : 'SITUATION DÉGRADÉE'}
                                    </div>
                                  </div>

                                  {/* Totaux absolus */}
                                  <div className="bg-gray-700/20 p-4 rounded-lg">
                                    <div className="text-white text-sm mb-3 font-bold">Valeurs absolues</div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-blue-300">Période 1 (Solde):</span>
                                        <span className="text-blue-400 font-bold">{formatCurrency(solde1)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-orange-300">Période 2 (Solde):</span>
                                        <span className="text-orange-400 font-bold">{formatCurrency(solde2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Vue Tableau */}
                  {budgetDashboardView === "table" && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Contrôles du tableau */}
                      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <h3 className="text-xl font-bold text-white">Liste des opérations</h3>
                          <div className="flex flex-wrap gap-3">
                            {/* Sélecteur d'année */}
                            <select 
                              value={tableConfig.year} 
                              onChange={(e) => setTableConfig(prev => ({ ...prev, year: parseInt(e.target.value), currentPage: 1 }))}
                              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-red-500"
                            >
                              {Array.from(new Set(budgetItems.map(item => new Date(item.date).getFullYear()))).sort((a, b) => b - a).map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                            
                            {/* Filtre par type */}
                            <select 
                              value={tableConfig.filterType} 
                              onChange={(e) => setTableConfig(prev => ({ ...prev, filterType: e.target.value, currentPage: 1 }))}
                              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-red-500"
                            >
                              <option value="all">Tous les types</option>
                              <option value="revenus">Revenus</option>
                              <option value="depenses_fixes">Dépenses fixes</option>
                              <option value="depenses_variables">Dépenses variables</option>
                              <option value="epargne">Épargne</option>
                              <option value="investissements">Investissements</option>
                            </select>

                            {/* Tri */}
                            <select 
                              value={`${tableConfig.sortBy}-${tableConfig.sortOrder}`} 
                              onChange={(e) => {
                                const [sortBy, sortOrder] = e.target.value.split('-');
                                setTableConfig(prev => ({ ...prev, sortBy, sortOrder }));
                              }}
                              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-red-500"
                            >
                              <option value="date-desc">Date (récent)</option>
                              <option value="date-asc">Date (ancien)</option>
                              <option value="amount-desc">Montant (élevé)</option>
                              <option value="amount-asc">Montant (faible)</option>
                            </select>

                            {/* Export */}
                            <button
                              onClick={() => exportToCSV(budgetItems)}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                              <Download className="w-4 h-4" />
                              Export CSV
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Tableau */}
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/30 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-700/50">
                              <tr>
                                <th className="text-left text-white font-medium p-4">Date</th>
                                <th className="text-left text-white font-medium p-4">Type</th>
                                <th className="text-left text-white font-medium p-4">Catégorie</th>
                                <th className="text-right text-white font-medium p-4">Montant</th>
                                <th className="text-left text-white font-medium p-4">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getTableData(budgetItems, tableConfig).items.map((item, index) => (
                                <tr key={item.id || index} className="border-t border-gray-700/30 hover:bg-gray-700/20">
                                  <td className="p-4 text-gray-300">
                                    {new Date(item.date).toLocaleDateString('fr-FR')}
                                  </td>
                                  <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      item.type === 'revenus' ? 'bg-green-100 text-green-800' :
                                      item.type === 'depenses_fixes' ? 'bg-red-100 text-red-800' :
                                      item.type === 'depenses_variables' ? 'bg-orange-100 text-orange-800' :
                                      item.type === 'epargne' ? 'bg-blue-100 text-blue-800' :
                                      'bg-purple-100 text-purple-800'
                                    }`}>
                                      {item.type.replace('_', ' ')}
                                    </span>
                                  </td>
                                  <td className="p-4 text-gray-300">
                                    {BUDGET_CATEGORIES[item.type]?.[item.category] || item.category}
                                  </td>
                                  <td className={`p-4 text-right font-medium ${
                                    item.type === 'revenus' ? 'text-green-400' : 
                                    item.type === 'epargne' || item.type === 'investissements' ? 'text-blue-400' :
                                    'text-red-400'
                                  }`}>
                                    {item.type === 'revenus' || item.type === 'epargne' || item.type === 'investissements' ? '+' : '-'}
                                    {formatCurrency(parseFloat(item.amount))}
                                  </td>
                                  <td className="p-4 text-gray-300 max-w-xs truncate">
                                    {item.description}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {(() => {
                          const tableData = getTableData(budgetItems, tableConfig);
                          return tableData.totalPages > 1 && (
                            <div className="bg-gray-700/30 px-6 py-4 flex items-center justify-between border-t border-gray-700/30">
                              <div className="text-sm text-gray-400">
                                Affichage {((tableConfig.currentPage - 1) * tableConfig.itemsPerPage) + 1} à {Math.min(tableConfig.currentPage * tableConfig.itemsPerPage, tableData.totalItems)} sur {tableData.totalItems} opérations
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setTableConfig(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                                  disabled={tableConfig.currentPage === 1}
                                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-white px-3 py-1 rounded-lg bg-red-600">
                                  {tableConfig.currentPage}
                                </span>
                                <span className="text-gray-400">sur {tableData.totalPages}</span>
                                <button
                                  onClick={() => setTableConfig(prev => ({ ...prev, currentPage: Math.min(tableData.totalPages, prev.currentPage + 1) }))}
                                  disabled={tableConfig.currentPage === tableData.totalPages}
                                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Aucune donnée financière disponible</p>
                  <p className="text-gray-500 text-sm mt-2">Commencez par ajouter des opérations dans l'onglet Budget</p>
                  <button
                    onClick={() => setActiveTab("budget")}
                    className="mt-4 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                  >
                    Aller au Budget
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* Section des tâches */}
        {activeTab === "tasks" && (
          <>
            {/* Zone d'ajout de tâche */}
            <div className="bg-gray-800 rounded-xl p-6 space-y-4">
              <div className="flex gap-3 items-center">
                <Input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="Que voulez-vous accomplir aujourd'hui ?" 
                  onKeyDown={(e) => { if (e.key === "Enter") addTask(); }} 
                  className="flex-1 h-12 text-lg rounded-lg border-0 bg-gray-700 text-white placeholder:text-gray-400 font-medium focus:bg-gray-600 focus:ring-2 focus:ring-red-500 transition-all duration-300" 
                />

                <div className="relative" ref={priorityMenuRef}>
                  <button
                    onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                    className={`w-auto min-w-48 h-12 rounded text-white border-0 text-sm px-3 flex items-center justify-between focus:outline-none ${
                      priorityChoice === "urgent" ? "bg-red-600" :
                      priorityChoice === "normal" ? "bg-orange-600" :
                      "bg-gray-600"
                    }`}
                  >
                    <span>
                      {PRIORITY_LABELS[priorityChoice]}
                    </span>
                    <span className="text-white ml-2">▼</span>
                  </button>
                  {showPriorityMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-gray-900 rounded border border-gray-700 z-10"
                    >
                      <div 
                        className="px-4 py-3 hover:bg-red-800/50 cursor-pointer rounded-t-lg text-white text-sm font-medium"
                        onClick={() => { setPriorityChoice("urgent"); setShowPriorityMenu(false); }}
                      >
                        {PRIORITY_LABELS["urgent"]}
                      </div>
                      <div 
                        className="px-4 py-3 hover:bg-orange-800/50 cursor-pointer text-white text-sm font-medium"
                        onClick={() => { setPriorityChoice("normal"); setShowPriorityMenu(false); }}
                      >
                        {PRIORITY_LABELS["normal"]}
                      </div>
                      <div 
                        className="px-4 py-3 hover:bg-gray-800 cursor-pointer rounded-b-lg text-white text-sm font-medium"
                        onClick={() => { setPriorityChoice("low"); setShowPriorityMenu(false); }}
                      >
                        {PRIORITY_LABELS["low"]}
                      </div>
                    </motion.div>
                  )}
                </div>

                <Button 
                  onClick={addTask} 
                  className="h-12 px-6 bg-red-600 text-white rounded hover:bg-red-500 text-lg font-bold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <Input 
                  placeholder="Rechercher des tâches..." 
                  className="flex-1 bg-gray-700 border-0 rounded-lg text-white placeholder:text-gray-400 text-base font-medium focus:bg-gray-600 focus:ring-2 focus:ring-red-500 transition-all duration-300" 
                  value={filter.q} 
                  onChange={(e) => setFilter({ ...filter, q: e.target.value })} 
                />
              </div>
            </div>

            {/* Zone d'affichage des tâches */}
            <div className="bg-gray-800 rounded-xl p-6 min-h-96">
              {(tasksByPriority.urgent.length === 0 && tasksByPriority.normal.length === 0 && tasksByPriority.low.length === 0) ? (
                <div className="text-center text-gray-400 py-16">
                  <div className="text-2xl mb-4">📝</div>
                  <div className="text-xl font-semibold mb-2">Aucune tâche pour le moment</div>
                  <div className="text-lg">Commencez par créer votre première tâche</div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Section À faire rapidement */}
                  {tasksByPriority.urgent.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3 pb-3 border-b border-red-500/30">
                        <div className="flex items-center gap-2 text-red-400 font-bold text-lg">
                          À faire rapidement
                          <span className="text-sm bg-red-600 text-white rounded w-6 h-6 flex items-center justify-center">
                            {tasksByPriority.urgent.length}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <AnimatePresence initial={false}>
                          {tasksByPriority.urgent.map(t => <TaskRow key={t.id} t={t} />)}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {/* Section À faire prochainement */}
                  {tasksByPriority.normal.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3 pb-3 border-b border-orange-500/30">
                        <div className="flex items-center gap-2 text-orange-400 font-bold text-lg">
                          À faire prochainement
                          <span className="text-sm bg-orange-600 text-white rounded w-6 h-6 flex items-center justify-center">
                            {tasksByPriority.normal.length}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <AnimatePresence initial={false}>
                          {tasksByPriority.normal.map(t => <TaskRow key={t.id} t={t} />)}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {/* Section À faire plus tard */}
                  {tasksByPriority.low.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3 pb-3 border-b border-gray-500/30">
                        <div className="flex items-center gap-2 text-gray-400 font-bold text-lg">
                          À faire plus tard
                          <span className="text-sm bg-gray-600 text-white rounded w-6 h-6 flex items-center justify-center">
                            {tasksByPriority.low.length}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <AnimatePresence initial={false}>
                          {tasksByPriority.low.map(t => <TaskRow key={t.id} t={t} />)}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Section des notes */}
        {activeTab === "notes" && (
          <>
            {/* Zone d'ajout de note */}
            <div className="bg-gray-800 rounded-xl p-6 space-y-4">
              <div className="space-y-3">
                <Input 
                  value={noteTitle} 
                  onChange={(e) => setNoteTitle(e.target.value)} 
                  placeholder="Titre de la note (optionnel)" 
                  onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) addNote(); }} 
                  className="h-12 text-lg rounded-lg border-0 bg-gray-700 text-white placeholder:text-gray-400 font-medium focus:bg-gray-600 focus:ring-2 focus:ring-red-500 transition-all duration-300" 
                />
                <textarea 
                  value={noteContent} 
                  onChange={(e) => setNoteContent(e.target.value)} 
                  placeholder="Contenu de votre note..." 
                  onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) addNote(); }} 
                  className="w-full h-24 p-3 text-lg rounded-lg border-0 bg-gray-700 text-white placeholder:text-gray-400 font-medium focus:bg-gray-600 focus:ring-2 focus:ring-red-500 transition-all duration-300 resize-none" 
                />
                <div className="flex gap-3">
                  {editingNote ? (
                    <>
                      <Button 
                        onClick={updateNote} 
                        className="flex-1 h-12 bg-green-600 text-white rounded hover:bg-green-500 text-lg font-bold"
                      >
                        Sauvegarder
                      </Button>
                      <Button 
                        onClick={cancelEdit} 
                        className="h-12 px-6 bg-gray-600 text-white rounded hover:bg-gray-500 text-lg font-bold"
                      >
                        Annuler
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={addNote} 
                      className="flex-1 h-12 bg-red-600 text-white rounded hover:bg-red-500 text-lg font-bold"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Ajouter une note
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Barre de recherche des notes */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <Input 
                  placeholder="Rechercher dans les notes..." 
                  className="flex-1 bg-gray-700 border-0 rounded-lg text-white placeholder:text-gray-400 text-base font-medium focus:bg-gray-600 focus:ring-2 focus:ring-red-500 transition-all duration-300" 
                  value={noteFilter.q} 
                  onChange={(e) => setNoteFilter({ ...noteFilter, q: e.target.value })} 
                />
              </div>
            </div>

            {/* Zone d'affichage des notes */}
            <div className="bg-gray-800 rounded-xl p-6 min-h-96">
              {filteredNotes.length === 0 ? (
                <div className="text-center text-gray-400 py-16">
                  <div className="text-2xl mb-4">📄</div>
                  <div className="text-xl font-semibold mb-2">Aucune note pour le moment</div>
                  <div className="text-lg">Commencez par créer votre première note</div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {filteredNotes.map(note => (
                      <motion.div 
                        key={note.id}
                        layout 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-700/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h3 className="font-bold text-xl text-white group-hover:text-red-400 transition-colors duration-300">
                              {note.title}
                            </h3>
                            <div className="flex gap-2">
                              <Button 
                                size="icon" 
                                variant="outline" 
                                onClick={() => startEditNote(note)} 
                                className="rounded-full bg-gray-600 hover:bg-gray-500 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
                              >
                                ✏️
                              </Button>
                              <Button 
                                size="icon" 
                                variant="outline" 
                                onClick={() => deleteNote(note.id)} 
                                className="rounded-full bg-red-600 hover:bg-red-500 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {note.content}
                          </p>
                          <div className="mt-4 text-xs text-gray-500">
                            Créée le {new Date(note.createdAt).toLocaleDateString('fr-FR')}
                            {note.updatedAt !== note.createdAt && (
                              <span> • Modifiée le {new Date(note.updatedAt).toLocaleDateString('fr-FR')}</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </>
        )}

        {/* Section des courses */}
        {activeTab === "shopping" && (
          <>
            {/* Zone d'ajout d'article */}
            <div className="bg-gray-800 rounded-xl p-6 space-y-4">
              <div className="space-y-3">
                <Input 
                  value={itemName} 
                  onChange={(e) => setItemName(e.target.value)} 
                  placeholder="Nom de l'article à acheter..." 
                  onKeyDown={(e) => { if (e.key === "Enter") addShoppingItem(); }} 
                  className="h-12 text-lg rounded-lg border-0 bg-gray-700 text-white placeholder:text-gray-400 font-medium focus:bg-gray-600 focus:ring-2 focus:ring-red-500 transition-all duration-300" 
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex gap-2 flex-1">
                    <Input 
                      type="number" 
                      min="1"
                      value={itemQuantity} 
                      onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                      placeholder="Qté" 
                      onKeyDown={(e) => { if (e.key === "Enter") addShoppingItem(); }} 
                      className="w-20 sm:w-24 h-12 text-lg rounded-lg border-0 bg-gray-700 text-white placeholder:text-gray-400 font-medium focus:bg-gray-600 focus:ring-2 focus:ring-red-500 transition-all duration-300" 
                    />
                    <select
                      value={itemUnit}
                      onChange={(e) => setItemUnit(e.target.value)}
                      className="w-24 sm:w-28 h-12 rounded-lg bg-gray-700 text-white border-0 text-lg px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                    >
                      {Object.entries(MEASUREMENT_UNITS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="w-full h-12 rounded-lg bg-gray-700 text-white border-0 text-lg px-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                    >
                      {Object.entries(SHOPPING_CATEGORIES).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  {editingItem ? (
                    <>
                      <Button 
                        onClick={updateShoppingItem} 
                        className="flex-1 h-12 bg-green-600 text-white rounded hover:bg-green-500 text-lg font-bold"
                      >
                        Sauvegarder
                      </Button>
                      <Button 
                        onClick={cancelEditItem} 
                        className="h-12 px-6 bg-gray-600 text-white rounded hover:bg-gray-500 text-lg font-bold"
                      >
                        Annuler
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={addShoppingItem} 
                      className="flex-1 h-12 bg-red-600 text-white rounded hover:bg-red-500 text-lg font-bold"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Valider
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Zone d'affichage des courses */}
            <div className="bg-gray-800 rounded-xl p-6 min-h-96">
              {filteredShoppingItems.length === 0 ? (
                <div className="text-center text-gray-400 py-16">
                  <div className="text-2xl mb-4">🛒</div>
                  <div className="text-xl font-semibold mb-2">Aucun article dans la liste</div>
                  <div className="text-lg">Commencez par ajouter votre premier article</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Section Courses courantes */}
                  {filteredShoppingItems.filter(item => item.category === 'courant').length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Courses courantes
                      </h3>
                      <div className="flex flex-col gap-4">
                        <AnimatePresence initial={false}>
                          {filteredShoppingItems.filter(item => item.category === 'courant').map(item => (
                            <motion.div 
                              key={item.id}
                              layout 
                              initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                              animate={{ opacity: 1, y: 0, scale: 1 }} 
                              exit={{ opacity: 0, y: -20, scale: 0.95 }}
                              className="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-700/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300"
                            >
                              <div className="relative flex items-center gap-4 p-6">
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  onClick={() => togglePurchased(item.id)} 
                                  className="relative rounded-full bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 group-hover:shadow-green-500/50"
                                >
                                  <Check className="w-5 h-5 text-white" />
                                </Button>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-3">
                                    <span className="font-semibold text-lg break-words leading-relaxed flex-1 text-gray-100 group-hover:text-white transition-colors duration-300">
                                      {item.quantity > 1 ? `${item.quantity}${item.unit} de ` : item.quantity === 1 ? `1${item.unit} de ` : ''}{item.name}
                                    </span>
                                  </div>
                                </div>
                                
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  onClick={() => startEditItem(item)} 
                                  className="rounded-full bg-gray-600 hover:bg-gray-500 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
                                >
                                  ✏️
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {/* Section Achats futurs */}
                  {filteredShoppingItems.filter(item => item.category === 'futur').length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Achats futurs
                      </h3>
                      <div className="flex flex-col gap-4">
                        <AnimatePresence initial={false}>
                          {filteredShoppingItems.filter(item => item.category === 'futur').map(item => (
                            <motion.div 
                              key={item.id}
                              layout 
                              initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                              animate={{ opacity: 1, y: 0, scale: 1 }} 
                              exit={{ opacity: 0, y: -20, scale: 0.95 }}
                              className="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-700/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300"
                            >
                              <div className="relative flex items-center gap-4 p-6">
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  onClick={() => togglePurchased(item.id)} 
                                  className="relative rounded-full bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 group-hover:shadow-green-500/50"
                                >
                                  <Check className="w-5 h-5 text-white" />
                                </Button>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-3">
                                    <span className="font-semibold text-lg break-words leading-relaxed flex-1 text-gray-100 group-hover:text-white transition-colors duration-300">
                                      {item.quantity > 1 ? `${item.quantity}${item.unit} de ` : item.quantity === 1 ? `1${item.unit} de ` : ''}{item.name}
                                    </span>
                                  </div>
                                </div>
                                
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  onClick={() => startEditItem(item)} 
                                  className="rounded-full bg-gray-600 hover:bg-gray-500 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
                                >
                                  ✏️
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Onglet Budget */}
        {activeTab === "budget" && (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Wallet className="w-8 h-8 text-red-400" />
                  Gestion du Budget
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </button>
                  <div className="text-right">
                  <div className="text-sm text-gray-400">Solde mensuel</div>
                  <div className={`text-2xl font-bold tabular-nums ${
                    (() => {
                      const currentDate = new Date();
                      const currentMonthBalance = ['revenus', 'depenses_fixes', 'depenses_variables', 'epargne', 'investissements']
                        .map(type => budgetItems.filter(item => {
                          const itemDate = new Date(item.date);
                          return item.type === type && 
                                 itemDate.getFullYear() === currentDate.getFullYear() && 
                                 itemDate.getMonth() === currentDate.getMonth();
                        }).reduce((sum, item) => sum + parseFloat(item.amount), 0))
                        .reduce((balance, total, index) => index === 0 ? total : balance - total, 0);
                      return currentMonthBalance >= 0 ? 'text-green-400' : 'text-red-400';
                    })()
                  }`}>
                    {(() => {
                      const currentDate = new Date();
                      const currentMonthBalance = ['revenus', 'depenses_fixes', 'depenses_variables', 'epargne', 'investissements']
                        .map(type => budgetItems.filter(item => {
                          const itemDate = new Date(item.date);
                          return item.type === type && 
                                 itemDate.getFullYear() === currentDate.getFullYear() && 
                                 itemDate.getMonth() === currentDate.getMonth();
                        }).reduce((sum, item) => sum + parseFloat(item.amount), 0))
                        .reduce((balance, total, index) => index === 0 ? total : balance - total, 0);
                      return formatCurrency(currentMonthBalance).replace(' CHF', '');
                    })()} CHF
                  </div>
                  </div>
                </div>
              </div>
              
              {/* Interface Paramètres */}
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-800/50 rounded-lg p-6 border border-gray-600/50 mb-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-red-400" />
                      Paramètres du Budget
                    </h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Onglets */}
                  <div className="flex gap-4 mb-6 border-b border-gray-600">
                    <button
                      onClick={() => setSettingsTab('recurring')}
                      className={`px-4 py-2 font-semibold transition-colors ${
                        settingsTab === 'recurring'
                          ? 'text-red-400 border-b-2 border-red-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Dépenses fixes récurrentes
                    </button>
                    <button
                      onClick={() => setSettingsTab('budgets')}
                      className={`px-4 py-2 font-semibold transition-colors ${
                        settingsTab === 'budgets'
                          ? 'text-red-400 border-b-2 border-red-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Budgets définis
                    </button>
                  </div>
                  
                  {/* Contenu des onglets */}
                  {settingsTab === 'recurring' && (
                    <div className="space-y-6">
                      <p className="text-gray-300 text-sm">
                        Définissez vos charges fixes qui s'ajouteront automatiquement chaque mois
                      </p>
                      
                      {/* Formulaire d'ajout */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-700/30 rounded-lg">
                        <Input
                          type="number"
                          placeholder="Montant (CHF)"
                          value={newRecurringExpense.amount}
                          onChange={(e) => setNewRecurringExpense({...newRecurringExpense, amount: e.target.value})}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        />
                        <select
                          value={newRecurringExpense.category}
                          onChange={(e) => setNewRecurringExpense({...newRecurringExpense, category: e.target.value})}
                          className="w-full rounded-lg bg-gray-700 text-white border border-gray-600 px-3 py-2"
                        >
                          <option value="loyer">Loyer</option>
                          <option value="abonnements">Abonnements</option>
                          <option value="assurances">Assurances</option>
                          <option value="credits">Crédits / Prêts</option>
                          <option value="telephonie">Téléphonie & Internet</option>
                        </select>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          placeholder="Jour du mois"
                          value={newRecurringExpense.dayOfMonth}
                          onChange={(e) => setNewRecurringExpense({...newRecurringExpense, dayOfMonth: parseInt(e.target.value)})}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        />
                        <button
                          onClick={() => {
                            if (newRecurringExpense.amount) {
                              setRecurringExpenses([...recurringExpenses, {
                                ...newRecurringExpense,
                                id: Date.now(),
                                amount: parseFloat(newRecurringExpense.amount)
                              }]);
                              setNewRecurringExpense({amount: '', category: 'loyer', dayOfMonth: 1});
                            }
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex-shrink-0"
                        >
                          Ajouter
                        </button>
                      </div>
                      
                      {/* Liste des dépenses récurrentes */}
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-white">Dépenses configurées</h4>
                        {recurringExpenses.length === 0 ? (
                          <p className="text-gray-400 italic">Aucune dépense récurrente configurée</p>
                        ) : (
                          <div className="space-y-2">
                            {recurringExpenses.map((expense) => (
                              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-4">
                                  <span className="font-medium text-white">{BUDGET_CATEGORIES.depenses_fixes[expense.category]}</span>
                                  <span className="text-red-400 font-semibold">{formatCurrency(expense.amount)}</span>
                                  <span className="text-gray-400 text-sm">Le {expense.dayOfMonth} de chaque mois</span>
                                </div>
                                <button
                                  onClick={() => setRecurringExpenses(recurringExpenses.filter(e => e.id !== expense.id))}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {settingsTab === 'budgets' && (
                    <div className="space-y-8">
                      {/* Budgets dépenses variables */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Budgets - Dépenses Variables</h4>
                        <p className="text-gray-300 text-sm">
                          Définissez des budgets mensuels pour chaque catégorie de dépenses variables
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {Object.entries({
                            alimentation: "Alimentation",
                            restaurants: "Restaurants",
                            bars_sorties: "Bars & Sorties",
                            loisirs: "Loisirs & Activités", 
                            shopping: "Shopping",
                            entretien: "Entretien logement"
                          }).map(([key, label]) => (
                            <div key={key} className="space-y-2">
                              <label className="block text-white font-medium text-sm">{label}</label>
                              <Input
                                type="number"
                                placeholder="Budget CHF"
                                value={budgetLimits.categories[key]}
                                onChange={(e) => setBudgetLimits({
                                  ...budgetLimits, 
                                  categories: {
                                    ...budgetLimits.categories,
                                    [key]: parseFloat(e.target.value) || 0
                                  }
                                })}
                                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              />
                              {/* Indicateur de progression en temps réel */}
                              {budgetLimits.categories[key] > 0 && (
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-300">Progression ce mois</span>
                                    <span className="text-xs font-medium text-white">
                                      {(() => {
                                        const currentDate = new Date();
                                        const spent = budgetItems.filter(item => {
                                          const itemDate = new Date(item.date);
                                          return item.type === 'depenses_variables' && 
                                                 item.category === key &&
                                                 itemDate.getFullYear() === currentDate.getFullYear() && 
                                                 itemDate.getMonth() === currentDate.getMonth();
                                        }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                        const percentage = (spent / budgetLimits.categories[key]) * 100;
                                        return `${percentage.toFixed(0)}%`;
                                      })()}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-700/40 rounded-full h-2 shadow-inner">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                                        (() => {
                                          const currentDate = new Date();
                                          const spent = budgetItems.filter(item => {
                                            const itemDate = new Date(item.date);
                                            return item.type === 'depenses_variables' && 
                                                   item.category === key &&
                                                   itemDate.getFullYear() === currentDate.getFullYear() && 
                                                   itemDate.getMonth() === currentDate.getMonth();
                                          }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                          const percentage = (spent / budgetLimits.categories[key]) * 100;
                                          return percentage > 100 ? 'bg-gradient-to-r from-red-400 to-red-600' : 
                                                 percentage > 80 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 
                                                 percentage > 60 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                                                 'bg-gradient-to-r from-green-400 to-green-600';
                                        })()
                                      }`}
                                      style={{
                                        width: `${Math.min(100, (() => {
                                          const currentDate = new Date();
                                          const spent = budgetItems.filter(item => {
                                            const itemDate = new Date(item.date);
                                            return item.type === 'depenses_variables' && 
                                                   item.category === key &&
                                                   itemDate.getFullYear() === currentDate.getFullYear() && 
                                                   itemDate.getMonth() === currentDate.getMonth();
                                          }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                          return (spent / budgetLimits.categories[key]) * 100;
                                        })())}%`
                                      }}
                                    ></div>
                                  </div>
                                  <div className="text-xs font-medium">
                                    {(() => {
                                      const currentDate = new Date();
                                      const spent = budgetItems.filter(item => {
                                        const itemDate = new Date(item.date);
                                        return item.type === 'depenses_variables' && 
                                               item.category === key &&
                                               itemDate.getFullYear() === currentDate.getFullYear() && 
                                               itemDate.getMonth() === currentDate.getMonth();
                                      }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                      const remaining = budgetLimits.categories[key] - spent;
                                      const isOverBudget = remaining < 0;
                                      return (
                                        <div className={`${isOverBudget ? 'text-red-300' : remaining <= budgetLimits.categories[key] * 0.2 ? 'text-yellow-300' : 'text-green-300'}`}>
                                          <div className="flex justify-between">
                                            <span>Dépensé: {formatCurrency(spent)}</span>
                                            <span>Budget: {formatCurrency(budgetLimits.categories[key])}</span>
                                          </div>
                                          <div className="text-center mt-1 font-semibold">
                                            {isOverBudget ? 
                                              `⚠️ Dépassement de ${formatCurrency(Math.abs(remaining))}` :
                                              `✅ Reste ${formatCurrency(remaining)} disponibles`
                                            }
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Budgets épargne */}
                      <div className="space-y-4 border-t border-gray-600 pt-6">
                        <h4 className="text-lg font-semibold text-white">Budgets - Épargne</h4>
                        <p className="text-gray-300 text-sm">
                          Définissez des budgets mensuels pour vos différentes épargnes
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries({
                            compte_epargne: "Épargne générale",
                            pilier3: "3ème pilier"
                          }).map(([key, label]) => (
                            <div key={key} className="space-y-2">
                              <label className="block text-white font-medium text-sm">{label}</label>
                              <Input
                                type="number"
                                placeholder="Budget mensuel CHF"
                                value={budgetLimits.epargne[key]}
                                onChange={(e) => setBudgetLimits({
                                  ...budgetLimits, 
                                  epargne: {
                                    ...budgetLimits.epargne,
                                    [key]: parseFloat(e.target.value) || 0
                                  }
                                })}
                                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Budgets investissements */}
                      <div className="space-y-4 border-t border-gray-600 pt-6">
                        <h4 className="text-lg font-semibold text-white">Budgets - Investissements</h4>
                        <p className="text-gray-300 text-sm">
                          Définissez des budgets mensuels pour vos différents investissements
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries({
                            bourse: "Bourse",
                            crypto: "Crypto",
                            immobilier: "Immobilier",
                            crowdfunding: "Crowdfunding"
                          }).map(([key, label]) => (
                            <div key={key} className="space-y-2">
                              <label className="block text-white font-medium text-sm">{label}</label>
                              <Input
                                type="number"
                                placeholder="Budget mensuel CHF"
                                value={budgetLimits.investissements[key]}
                                onChange={(e) => setBudgetLimits({
                                  ...budgetLimits, 
                                  investissements: {
                                    ...budgetLimits.investissements,
                                    [key]: parseFloat(e.target.value) || 0
                                  }
                                })}
                                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Objectifs à long terme */}
                      <div className="space-y-4 border-t border-gray-600 pt-6">
                        <h4 className="text-lg font-semibold text-white">Objectifs à long terme</h4>
                        <p className="text-gray-300 text-sm">
                          Définissez vos objectifs globaux d'épargne et d'investissement (ex: 100k CHF en 5 ans)
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="block text-white font-medium">Objectif d'épargne total</label>
                            <Input
                              type="number"
                              placeholder="Objectif total (CHF)"
                              value={budgetLimits.longTerm.epargne}
                              onChange={(e) => setBudgetLimits({
                                ...budgetLimits, 
                                longTerm: {
                                  ...budgetLimits.longTerm,
                                  epargne: parseFloat(e.target.value) || 0
                                }
                              })}
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            />
                            <p className="text-gray-400 text-xs">Ex: 100'000 CHF à atteindre</p>
                          </div>
                          
                          <div className="space-y-3">
                            <label className="block text-white font-medium">Objectif d'investissement total</label>
                            <Input
                              type="number"
                              placeholder="Objectif total (CHF)"
                              value={budgetLimits.longTerm.investissements}
                              onChange={(e) => setBudgetLimits({
                                ...budgetLimits, 
                                longTerm: {
                                  ...budgetLimits.longTerm,
                                  investissements: parseFloat(e.target.value) || 0
                                }
                              })}
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            />
                            <p className="text-gray-400 text-xs">Ex: 50'000 CHF à investir</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-400 italic">
                        Les budgets sont sauvegardés automatiquement
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              
              <div className="space-y-4">
                {/* Ligne supérieure - Montant, Type, Catégorie, Date avec animations */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <motion.div whileFocus={{ scale: 1.02 }}>
                    <Input 
                      type="number"
                      placeholder="Montant (CHF)..." 
                      value={budgetAmount} 
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      className="bg-gray-700/80 backdrop-blur-sm border-gray-600 text-white placeholder-gray-400 text-lg h-12 focus:border-red-500 focus:ring-red-500 transition-all duration-300 hover:bg-gray-700"
                    />
                  </motion.div>
                  
                  <motion.div whileFocus={{ scale: 1.02 }}>
                    <select 
                      value={budgetType} 
                      onChange={(e) => handleBudgetTypeChange(e.target.value)}
                      className="w-full h-12 rounded-lg bg-gray-700/80 backdrop-blur-sm text-white border border-gray-600 text-lg px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:bg-gray-700"
                    >
                      <option value="revenus">Revenus</option>
                      <option value="depenses_fixes">Dépenses fixes</option>
                      <option value="depenses_variables">Dépenses variables</option>
                      <option value="epargne">Épargne</option>
                      <option value="investissements">Investissements</option>
                    </select>
                  </motion.div>
                  
                  <motion.div whileFocus={{ scale: 1.02 }}>
                    <select 
                      value={budgetCategory} 
                      onChange={(e) => setBudgetCategory(e.target.value)}
                      className="w-full h-12 rounded-lg bg-gray-700/80 backdrop-blur-sm text-white border border-gray-600 text-lg px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:bg-gray-700"
                    >
                      {Object.entries(BUDGET_CATEGORIES[budgetType]).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </motion.div>
                  
                  <motion.div whileFocus={{ scale: 1.02 }}>
                    <Input 
                      type="date"
                      value={budgetDate} 
                      onChange={(e) => setBudgetDate(e.target.value)}
                      className="bg-gray-700/80 backdrop-blur-sm border-gray-600 text-white placeholder-gray-400 text-lg h-12 focus:border-red-500 focus:ring-red-500 transition-all duration-300 hover:bg-gray-700"
                    />
                  </motion.div>
                </div>
                
                {/* Ligne inférieure - Description + Bouton avec animations */}
                <div className="flex gap-4">
                  <motion.div whileFocus={{ scale: 1.01 }} className="flex-1">
                    <Input 
                      placeholder="Description (optionnelle)..." 
                      value={budgetDescription} 
                      onChange={(e) => setBudgetDescription(e.target.value)}
                      className="bg-gray-700/80 backdrop-blur-sm border-gray-600 text-white placeholder-gray-400 text-lg h-12 focus:border-red-500 focus:ring-red-500 transition-all duration-300 hover:bg-gray-700"
                    />
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={editingBudgetItem ? updateBudgetItem : addBudgetItem} 
                      className="h-12 px-6 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg hover:shadow-xl text-lg font-bold transition-all duration-300 border-0"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      {editingBudgetItem ? "Modifier" : "Ajouter"}
                    </Button>
                  </motion.div>
                </div>
                
                {editingBudgetItem && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      onClick={cancelEditBudgetItem} 
                      variant="outline"
                      className="h-12 px-6 border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:border-red-500 hover:text-red-300 text-lg font-bold transition-all duration-300"
                    >
                      Annuler
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Jauges de progression des budgets définis */}
            {(Object.values(budgetLimits.categories).some(limit => limit > 0) || 
              Object.values(budgetLimits.epargne).some(limit => limit > 0) || 
              Object.values(budgetLimits.investissements).some(limit => limit > 0)) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl mb-6"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Progression des Budgets (ce mois)
                </h3>
                
                <div className="space-y-6">
                  {/* Dépenses Variables */}
                  {Object.values(budgetLimits.categories).some(limit => limit > 0) && (
                    <div>
                      <h4 className="text-md font-semibold text-white mb-3 text-red-400">Dépenses Variables</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries({
                          alimentation: "Alimentation",
                          restaurants: "Restaurants",
                          bars_sorties: "Bars & Sorties",
                          loisirs: "Loisirs & Activités", 
                          shopping: "Shopping",
                          entretien: "Entretien logement"
                        }).filter(([key, label]) => budgetLimits.categories[key] > 0).map(([key, label]) => (
                          <div key={key} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-white font-medium text-sm">{label}</span>
                              <span className="text-xs font-bold text-blue-400">
                                {(() => {
                                  const currentDate = new Date();
                                  const spent = budgetItems.filter(item => {
                                    const itemDate = new Date(item.date);
                                    return item.type === 'depenses_variables' && 
                                           item.category === key &&
                                           itemDate.getFullYear() === currentDate.getFullYear() && 
                                           itemDate.getMonth() === currentDate.getMonth();
                                  }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                  const percentage = (spent / budgetLimits.categories[key]) * 100;
                                  return `${percentage.toFixed(0)}%`;
                                })()}
                              </span>
                            </div>
                            
                            <div className="w-full bg-gray-600/50 rounded-full h-3 mb-2 shadow-inner">
                              <div 
                                className="h-3 rounded-full transition-all duration-500 shadow-sm bg-gradient-to-r from-blue-400 to-blue-600"
                                style={{
                                  width: `${Math.min(100, (() => {
                                    const currentDate = new Date();
                                    const spent = budgetItems.filter(item => {
                                      const itemDate = new Date(item.date);
                                      return item.type === 'depenses_variables' && 
                                             item.category === key &&
                                             itemDate.getFullYear() === currentDate.getFullYear() && 
                                             itemDate.getMonth() === currentDate.getMonth();
                                    }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                    return (spent / budgetLimits.categories[key]) * 100;
                                  })())}%`
                                }}
                              ></div>
                            </div>
                            
                            <div className="text-xs">
                              {(() => {
                                const currentDate = new Date();
                                const spent = budgetItems.filter(item => {
                                  const itemDate = new Date(item.date);
                                  return item.type === 'depenses_variables' && 
                                         item.category === key &&
                                         itemDate.getFullYear() === currentDate.getFullYear() && 
                                         itemDate.getMonth() === currentDate.getMonth();
                                }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                const remaining = budgetLimits.categories[key] - spent;
                                const isOverBudget = remaining < 0;
                                
                                return (
                                  <div>
                                    <div className={`flex justify-between ${isOverBudget ? 'text-red-300' : remaining <= budgetLimits.categories[key] * 0.2 ? 'text-yellow-300' : 'text-green-300'}`}>
                                      <span>{formatCurrency(spent)}</span>
                                      <span>/ {formatCurrency(budgetLimits.categories[key])}</span>
                                    </div>
                                    <div className={`text-center mt-1 font-medium ${isOverBudget ? 'text-red-300' : 'text-green-300'}`}>
                                      {isOverBudget ? 
                                        `⚠️ Dépassé de ${formatCurrency(Math.abs(remaining))}` :
                                        `✅ ${formatCurrency(remaining)} restants`
                                      }
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Épargne */}
                  {Object.values(budgetLimits.epargne).some(limit => limit > 0) && (
                    <div>
                      <h4 className="text-md font-semibold text-white mb-3 text-blue-400">Épargne</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries({
                          compte_epargne: "Épargne générale",
                          pilier3: "3ème pilier"
                        }).filter(([key, label]) => budgetLimits.epargne[key] > 0).map(([key, label]) => (
                          <div key={key} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-white font-medium text-sm">{label}</span>
                              <span className="text-xs font-bold text-blue-400">
                                {(() => {
                                  const currentDate = new Date();
                                  const saved = budgetItems.filter(item => {
                                    const itemDate = new Date(item.date);
                                    return item.type === 'epargne' && 
                                           item.category === key &&
                                           itemDate.getFullYear() === currentDate.getFullYear() && 
                                           itemDate.getMonth() === currentDate.getMonth();
                                  }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                  const percentage = (saved / budgetLimits.epargne[key]) * 100;
                                  return `${percentage.toFixed(0)}%`;
                                })()}
                              </span>
                            </div>
                            
                            <div className="w-full bg-gray-600/50 rounded-full h-3 mb-2 shadow-inner">
                              <div 
                                className="h-3 rounded-full transition-all duration-500 shadow-sm bg-gradient-to-r from-blue-400 to-blue-600"
                                style={{
                                  width: `${Math.min(100, (() => {
                                    const currentDate = new Date();
                                    const saved = budgetItems.filter(item => {
                                      const itemDate = new Date(item.date);
                                      return item.type === 'epargne' && 
                                             item.category === key &&
                                             itemDate.getFullYear() === currentDate.getFullYear() && 
                                             itemDate.getMonth() === currentDate.getMonth();
                                    }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                    return (saved / budgetLimits.epargne[key]) * 100;
                                  })())}%`
                                }}
                              ></div>
                            </div>
                            
                            <div className="text-xs">
                              {(() => {
                                const currentDate = new Date();
                                const saved = budgetItems.filter(item => {
                                  const itemDate = new Date(item.date);
                                  return item.type === 'epargne' && 
                                         item.category === key &&
                                         itemDate.getFullYear() === currentDate.getFullYear() && 
                                         itemDate.getMonth() === currentDate.getMonth();
                                }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                const remaining = budgetLimits.epargne[key] - saved;
                                const isUnderTarget = remaining > 0;
                                
                                return (
                                  <div>
                                    <div className={`flex justify-between ${isUnderTarget ? 'text-yellow-300' : 'text-green-300'}`}>
                                      <span>{formatCurrency(saved)}</span>
                                      <span>/ {formatCurrency(budgetLimits.epargne[key])}</span>
                                    </div>
                                    <div className={`text-center mt-1 font-medium ${isUnderTarget ? 'text-yellow-300' : 'text-green-300'}`}>
                                      {isUnderTarget ? 
                                        `💰 ${formatCurrency(remaining)} à épargner` :
                                        `✅ Objectif atteint ! +${formatCurrency(Math.abs(remaining))}`
                                      }
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Investissements */}
                  {Object.values(budgetLimits.investissements).some(limit => limit > 0) && (
                    <div>
                      <h4 className="text-md font-semibold text-white mb-3 text-purple-400">Investissements</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries({
                          bourse: "Bourse",
                          crypto: "Crypto",
                          immobilier: "Immobilier",
                          crowdfunding: "Crowdfunding"
                        }).filter(([key, label]) => budgetLimits.investissements[key] > 0).map(([key, label]) => (
                          <div key={key} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-white font-medium text-sm">{label}</span>
                              <span className="text-xs font-bold text-blue-400">
                                {(() => {
                                  const currentDate = new Date();
                                  const invested = budgetItems.filter(item => {
                                    const itemDate = new Date(item.date);
                                    return item.type === 'investissements' && 
                                           item.category === key &&
                                           itemDate.getFullYear() === currentDate.getFullYear() && 
                                           itemDate.getMonth() === currentDate.getMonth();
                                  }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                  const percentage = (invested / budgetLimits.investissements[key]) * 100;
                                  return `${percentage.toFixed(0)}%`;
                                })()}
                              </span>
                            </div>
                            
                            <div className="w-full bg-gray-600/50 rounded-full h-3 mb-2 shadow-inner">
                              <div 
                                className="h-3 rounded-full transition-all duration-500 shadow-sm bg-gradient-to-r from-blue-400 to-blue-600"
                                style={{
                                  width: `${Math.min(100, (() => {
                                    const currentDate = new Date();
                                    const invested = budgetItems.filter(item => {
                                      const itemDate = new Date(item.date);
                                      return item.type === 'investissements' && 
                                             item.category === key &&
                                             itemDate.getFullYear() === currentDate.getFullYear() && 
                                             itemDate.getMonth() === currentDate.getMonth();
                                    }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                    return (invested / budgetLimits.investissements[key]) * 100;
                                  })())}%`
                                }}
                              ></div>
                            </div>
                            
                            <div className="text-xs">
                              {(() => {
                                const currentDate = new Date();
                                const invested = budgetItems.filter(item => {
                                  const itemDate = new Date(item.date);
                                  return item.type === 'investissements' && 
                                         item.category === key &&
                                         itemDate.getFullYear() === currentDate.getFullYear() && 
                                         itemDate.getMonth() === currentDate.getMonth();
                                }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                                const remaining = budgetLimits.investissements[key] - invested;
                                const isUnderTarget = remaining > 0;
                                
                                return (
                                  <div>
                                    <div className={`flex justify-between ${isUnderTarget ? 'text-yellow-300' : 'text-green-300'}`}>
                                      <span>{formatCurrency(invested)}</span>
                                      <span>/ {formatCurrency(budgetLimits.investissements[key])}</span>
                                    </div>
                                    <div className={`text-center mt-1 font-medium ${isUnderTarget ? 'text-yellow-300' : 'text-green-300'}`}>
                                      {isUnderTarget ? 
                                        `🚀 ${formatCurrency(remaining)} à investir` :
                                        `✅ Objectif atteint ! +${formatCurrency(Math.abs(remaining))}`
                                      }
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Cartes colorées résumé */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative overflow-hidden bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30 backdrop-blur-sm group cursor-pointer min-h-[100px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative h-full flex flex-col justify-center">
                  <div className="text-green-400 text-sm font-medium mb-3 text-center leading-tight">Revenus</div>
                  <div className="flex items-center justify-center text-white text-xl font-bold tabular-nums">
                    <span className="text-green-400 w-4 text-center">+</span>
                    <span className="mx-1">{(() => {
                      const currentDate = new Date();
                      const total = budgetItems.filter(item => {
                        const itemDate = new Date(item.date);
                        return item.type === 'revenus' && 
                               itemDate.getFullYear() === currentDate.getFullYear() && 
                               itemDate.getMonth() === currentDate.getMonth();
                      }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                      return formatCurrency(total).replace(' CHF', '');
                    })()}</span>
                    <span className="text-gray-300 text-base ml-1">CHF</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative overflow-hidden bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-4 border border-red-500/30 backdrop-blur-sm group cursor-pointer min-h-[100px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative h-full flex flex-col justify-center">
                  <div className="text-red-400 text-sm font-medium mb-3 text-center leading-tight">Dépenses fixes</div>
                  <div className="flex items-center justify-center text-white text-xl font-bold tabular-nums">
                    <span className="text-red-400 w-4 text-center">-</span>
                    <span className="mx-1">{(() => {
                      const total = budgetItems.filter(item => {
                        const itemDate = new Date(item.date);
                        const currentDate = new Date();
                        return item.type === 'depenses_fixes' && 
                               itemDate.getFullYear() === currentDate.getFullYear() && 
                               itemDate.getMonth() === currentDate.getMonth();
                      }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                      return formatCurrency(total).replace(' CHF', '');
                    })()}</span>
                    <span className="text-gray-300 text-base ml-1">CHF</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative overflow-hidden bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30 backdrop-blur-sm group cursor-pointer min-h-[100px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative h-full flex flex-col justify-center">
                  <div className="text-orange-400 text-sm font-medium mb-3 text-center leading-tight">Dépenses variables</div>
                  <div className="flex items-center justify-center text-white text-xl font-bold tabular-nums">
                    <span className="text-orange-400 w-4 text-center">-</span>
                    <span className="mx-1">{(() => {
                      const total = budgetItems.filter(item => {
                        const itemDate = new Date(item.date);
                        const currentDate = new Date();
                        return item.type === 'depenses_variables' && 
                               itemDate.getFullYear() === currentDate.getFullYear() && 
                               itemDate.getMonth() === currentDate.getMonth();
                      }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                      return formatCurrency(total).replace(' CHF', '');
                    })()}</span>
                    <span className="text-gray-300 text-base ml-1">CHF</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative overflow-hidden bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30 backdrop-blur-sm group cursor-pointer min-h-[100px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative h-full flex flex-col justify-center">
                  <div className="text-blue-400 text-sm font-medium mb-3 text-center leading-tight">Épargne</div>
                  <div className="flex items-center justify-center text-white text-xl font-bold tabular-nums">
                    <span className="text-blue-400 w-4 text-center">+</span>
                    <span className="mx-1">{(() => {
                      const total = budgetItems.filter(item => {
                        const itemDate = new Date(item.date);
                        const currentDate = new Date();
                        return item.type === 'epargne' && 
                               itemDate.getFullYear() === currentDate.getFullYear() && 
                               itemDate.getMonth() === currentDate.getMonth();
                      }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                      return formatCurrency(total).replace(' CHF', '');
                    })()}</span>
                    <span className="text-gray-300 text-base ml-1">CHF</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30 backdrop-blur-sm group cursor-pointer min-h-[100px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative h-full flex flex-col justify-center">
                  <div className="text-purple-400 text-sm font-medium mb-3 text-center leading-tight">Investissements</div>
                  <div className="flex items-center justify-center text-white text-xl font-bold tabular-nums">
                    <span className="text-purple-400 w-4 text-center">+</span>
                    <span className="mx-1">{(() => {
                      const total = budgetItems.filter(item => {
                        const itemDate = new Date(item.date);
                        const currentDate = new Date();
                        return item.type === 'investissements' && 
                               itemDate.getFullYear() === currentDate.getFullYear() && 
                               itemDate.getMonth() === currentDate.getMonth();
                      }).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                      return formatCurrency(total).replace(' CHF', '');
                    })()}</span>
                    <span className="text-gray-300 text-base ml-1">CHF</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className={`relative overflow-hidden rounded-xl p-4 backdrop-blur-sm group cursor-pointer border min-h-[100px] ${
                  (() => {
                    const currentDate = new Date();
                    const monthlyBalance = ['revenus', 'depenses_fixes', 'depenses_variables', 'epargne', 'investissements']
                      .map(type => budgetItems.filter(item => {
                        const itemDate = new Date(item.date);
                        return item.type === type && 
                               itemDate.getFullYear() === currentDate.getFullYear() && 
                               itemDate.getMonth() === currentDate.getMonth();
                      }).reduce((sum, item) => sum + parseFloat(item.amount), 0))
                      .reduce((balance, total, index) => index === 0 ? total : balance - total, 0);
                    return monthlyBalance >= 0 
                      ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30'
                      : 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30';
                  })()
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  (() => {
                    const currentDate = new Date();
                    const monthlyBalance = ['revenus', 'depenses_fixes', 'depenses_variables', 'epargne', 'investissements']
                      .map(type => budgetItems.filter(item => {
                        const itemDate = new Date(item.date);
                        return item.type === type && 
                               itemDate.getFullYear() === currentDate.getFullYear() && 
                               itemDate.getMonth() === currentDate.getMonth();
                      }).reduce((sum, item) => sum + parseFloat(item.amount), 0))
                      .reduce((balance, total, index) => index === 0 ? total : balance - total, 0);
                    return monthlyBalance >= 0 ? 'from-emerald-400/10' : 'from-red-400/10';
                  })()
                } to-transparent`}></div>
                <div className="relative h-full flex flex-col justify-center">
                  <div className={`text-sm font-medium mb-3 text-center leading-tight ${
                    (() => {
                      const currentDate = new Date();
                      const monthlyBalance = ['revenus', 'depenses_fixes', 'depenses_variables', 'epargne', 'investissements']
                        .map(type => budgetItems.filter(item => {
                          const itemDate = new Date(item.date);
                          return item.type === type && 
                                 itemDate.getFullYear() === currentDate.getFullYear() && 
                                 itemDate.getMonth() === currentDate.getMonth();
                        }).reduce((sum, item) => sum + parseFloat(item.amount), 0))
                        .reduce((balance, total, index) => index === 0 ? total : balance - total, 0);
                      return monthlyBalance >= 0 ? 'text-emerald-400' : 'text-red-400';
                    })()
                  }`}>
                    Solde mensuel
                  </div>
                  <div className="flex items-center justify-center text-white text-xl font-bold tabular-nums">
                    {(() => {
                      const currentDate = new Date();
                      const monthlyBalance = ['revenus', 'depenses_fixes', 'depenses_variables', 'epargne', 'investissements']
                        .map(type => budgetItems.filter(item => {
                          const itemDate = new Date(item.date);
                          return item.type === type && 
                                 itemDate.getFullYear() === currentDate.getFullYear() && 
                                 itemDate.getMonth() === currentDate.getMonth();
                        }).reduce((sum, item) => sum + parseFloat(item.amount), 0))
                        .reduce((balance, total, index) => index === 0 ? total : balance - total, 0);
                      const isPositive = monthlyBalance >= 0;
                      const sign = isPositive ? '+' : '-';
                      const color = isPositive ? 'text-emerald-400' : 'text-red-400';
                      return (
                        <>
                          <span className={`${color} w-4 text-center`}>{sign}</span>
                          <span className="mx-1">{formatCurrency(Math.abs(monthlyBalance)).replace(' CHF', '')}</span>
                          <span className="text-gray-300 text-base ml-1">CHF</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Liste des opérations */}
            {budgetItems.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 shadow-2xl"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Opérations récentes</h3>
                
                <div className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {budgetItems
                      .filter(item => {
                        const itemDate = new Date(item.date);
                        const currentDate = new Date();
                        return itemDate.getFullYear() === currentDate.getFullYear() && 
                               itemDate.getMonth() === currentDate.getMonth();
                      })
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map(item => (
                        <motion.div 
                          key={item.id}
                          layout 
                          initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                          animate={{ opacity: 1, y: 0, scale: 1 }} 
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-700/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                          {/* Effet de brillance au hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          
                          <div className="relative flex items-center gap-4 p-6">
                            <div className={`w-4 h-4 rounded-full ${
                              item.type === 'revenus' ? 'bg-green-500' : 
                              item.type === 'depenses_fixes' ? 'bg-red-500' : 
                              item.type === 'depenses_variables' ? 'bg-orange-500' : 
                              item.type === 'epargne' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}></div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <div className="font-semibold text-lg text-gray-100 group-hover:text-white transition-colors duration-300">
                                    {item.description || BUDGET_CATEGORIES[item.type][item.category]}
                                  </div>
                                  <div className="text-sm text-gray-400 mt-1">
                                    {BUDGET_CATEGORIES[item.type][item.category]} • {new Date(item.date).toLocaleDateString('fr-FR')}
                                  </div>
                                </div>
                                <div className={`text-xl font-bold ${
                                  item.type === 'revenus' ? 'text-green-400' : 
                                  item.type === 'depenses_fixes' ? 'text-red-400' : 
                                  item.type === 'depenses_variables' ? 'text-orange-400' : 
                                  item.type === 'epargne' ? 'text-blue-400' : 'text-purple-400'
                                }`}>
                                  {item.type === 'revenus' ? '+' : '-'}{formatCurrency(parseFloat(item.amount))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="icon" 
                                variant="outline" 
                                onClick={() => startEditBudgetItem(item)} 
                                className="rounded-full bg-gray-600 hover:bg-gray-500 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
                              >
                                ✏️
                              </Button>
                              <Button 
                                size="icon" 
                                variant="outline" 
                                onClick={() => deleteBudgetItem(item.id)} 
                                className="rounded-full bg-red-600 hover:bg-red-500 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>

              </motion.div>
            )}

            {budgetItems.length === 0 && (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Aucune opération enregistrée.</p>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-800">
          <div className="flex flex-col items-center justify-center gap-3">
            {/* Logo et nom */}
            <div className="flex flex-col items-center">
              <LogoDevSwiss className="w-16 h-16 text-white" showText={false} />
              <span className="text-white text-xl font-bold">Dev-Swiss</span>
            </div>
            
            {/* Texte descriptif séparé */}
            <div className="border-t border-gray-700 pt-2 mt-1">
              <span className="text-white text-sm">Solutions web & apps sur mesure</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
