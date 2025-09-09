-- ============================================================================
-- SCRIPT DE NETTOYAGE - Supprimer les tables Table Editor
-- Copier-coller ce script dans SQL Editor AVANT le script principal
-- ============================================================================

-- Supprimer toutes les tables et leurs dépendances
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.shopping_items CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.budget_items CASCADE;

-- Supprimer les fonctions existantes si elles existent
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '🗑️ Nettoyage terminé!';
    RAISE NOTICE '✅ Toutes les tables Table Editor supprimées';
    RAISE NOTICE '✅ Toutes les fonctions nettoyées';
    RAISE NOTICE '🚀 Prêt pour le script SQL optimisé!';
END $$;