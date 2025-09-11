import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

// Hook principal pour la gestion des données avec Supabase
export const useSupabaseData = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(isSupabaseConfigured())

  useEffect(() => {
    if (!supabase) {
      console.error('Supabase client non disponible')
      setLoading(false)
      return
    }

    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(error => {
      console.error('Erreur getSession:', error)
      setLoading(false)
    })

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    loading,
    isOnline,
    supabase
  }
}

// Hook pour la gestion des éléments de budget
export const useBudgetItems = (user) => {
  const [budgetItems, setBudgetItems] = useState([])
  const [loading, setLoading] = useState(false)

  const loadBudgetItems = async () => {
    if (!user || !isSupabaseConfigured()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('budget_items')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      setBudgetItems(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des éléments de budget:', error)
    }
    setLoading(false)
  }

  const addBudgetItem = async (item) => {
    if (!user || !isSupabaseConfigured()) return

    try {
      const { data, error } = await supabase
        .from('budget_items')
        .insert([{ ...item, user_id: user.id }])
        .select()

      if (error) throw error
      setBudgetItems(prev => [data[0], ...prev])
      return data[0]
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'élément:', error)
      throw error
    }
  }

  const updateBudgetItem = async (id, updates) => {
    if (!user || !isSupabaseConfigured()) return

    try {
      const { data, error } = await supabase
        .from('budget_items')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) throw error
      setBudgetItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ))
      return data[0]
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      throw error
    }
  }

  const deleteBudgetItem = async (id) => {
    if (!user || !isSupabaseConfigured()) return

    try {
      const { error } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      setBudgetItems(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      throw error
    }
  }

  useEffect(() => {
    loadBudgetItems()
  }, [user])

  return {
    budgetItems,
    loading,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    loadBudgetItems
  }
}

// Hook pour la gestion des tâches
export const useTasks = (user) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)

  const loadTasks = async () => {
    if (!user || !isSupabaseConfigured()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error)
    }
    setLoading(false)
  }

  const addTask = async (task) => {
    if (!user || !isSupabaseConfigured()) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...task, user_id: user.id }])
        .select()

      if (error) throw error
      setTasks(prev => [data[0], ...prev])
      return data[0]
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la tâche:', error)
      throw error
    }
  }

  const updateTask = async (id, updates) => {
    if (!user || !isSupabaseConfigured()) return

    try {
      // Si on marque comme complété, ajouter completed_at
      if (updates.completed && !updates.completed_at) {
        updates.completed_at = new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) throw error
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ))
      return data[0]
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error)
      throw error
    }
  }

  const deleteTask = async (id) => {
    if (!user || !isSupabaseConfigured()) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      setTasks(prev => prev.filter(task => task.id !== id))
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error)
      throw error
    }
  }

  useEffect(() => {
    loadTasks()
  }, [user])

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    loadTasks
  }
}

// Hook pour la gestion des notes
export const useNotes = (user) => {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)

  const loadNotes = async () => {
    if (!user || !isSupabaseConfigured()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error)
    }
    setLoading(false)
  }

  const addNote = async (note) => {
    if (!user || !isSupabaseConfigured()) return

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ ...note, user_id: user.id }])
        .select()

      if (error) throw error
      setNotes(prev => [data[0], ...prev])
      return data[0]
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la note:', error)
      throw error
    }
  }

  const updateNote = async (id, updates) => {
    if (!user || !isSupabaseConfigured()) return

    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) throw error
      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, ...updates } : note
      ))
      return data[0]
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error)
      throw error
    }
  }

  const deleteNote = async (id) => {
    if (!user || !isSupabaseConfigured()) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      setNotes(prev => prev.filter(note => note.id !== id))
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error)
      throw error
    }
  }

  useEffect(() => {
    loadNotes()
  }, [user])

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    loadNotes
  }
}

// Hook pour la gestion des éléments de shopping
export const useShoppingItems = (user) => {
  const [shoppingItems, setShoppingItems] = useState([])
  const [loading, setLoading] = useState(false)

  const loadShoppingItems = async () => {
    if (!user || !isSupabaseConfigured()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setShoppingItems(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des éléments de shopping:', error)
    }
    setLoading(false)
  }

  const addShoppingItem = async (item) => {
    if (!user || !isSupabaseConfigured()) return

    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .insert([{ ...item, user_id: user.id }])
        .select()

      if (error) throw error
      setShoppingItems(prev => [data[0], ...prev])
      return data[0]
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'élément de shopping:', error)
      throw error
    }
  }

  const updateShoppingItem = async (id, updates) => {
    if (!user || !isSupabaseConfigured()) return

    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) throw error
      setShoppingItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ))
      return data[0]
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'élément de shopping:', error)
      throw error
    }
  }

  const deleteShoppingItem = async (id) => {
    if (!user || !isSupabaseConfigured()) return

    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      setShoppingItems(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'élément de shopping:', error)
      throw error
    }
  }

  useEffect(() => {
    loadShoppingItems()
  }, [user])

  return {
    shoppingItems,
    loading,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    loadShoppingItems
  }
}