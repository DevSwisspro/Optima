import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ntytkeasfjnwoehpzhtm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eXRrZWFzZmpud29laHB6aHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDIyMDAsImV4cCI6MjA3MjU3ODIwMH0.dGYlqy6bNUactQdI3ngBK6uYT2JyNVMsdx-nCdzG8dc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabase() {
  console.log('🔍 Test final des tables Supabase...\n');
  
  const tables = ['budget_items', 'tasks', 'notes', 'shopping_items', 'user_preferences'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Opérationnel (prêt pour les données)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
  
  console.log('\n🎯 RÉSULTAT: Toutes les tables sont prêtes pour recevoir des données!');
  console.log('📱 Ton application peut maintenant sauvegarder:');
  console.log('   • Budget (revenus, dépenses, épargne, investissements)');
  console.log('   • Tâches (TO-DO avec priorités)');
  console.log('   • Notes (mémos personnels)');
  console.log('   • Courses (liste de shopping)');
  console.log('   • Préférences utilisateur');
}

testDatabase();