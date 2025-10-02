import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Helpers -----------------------------------------------------------
const LS_KEY = "todo_coach_v2";
const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// Traductions des priorités
const PRIORITY_LABELS = {
  urgent: "À faire vite",
  normal: "Moyen",
  low: "Pas pressant"
};

// Ordre des priorités
const PRIORITY_ORDER = { urgent: 0, normal: 1, low: 2 };

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

  useEffect(() => {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) setTasks(JSON.parse(raw)); } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(tasks)); } catch {}
  }, [tasks]);

  const addTask = () => {
    const parsed = parseTaskNLP(input);
    if (!parsed.title) return;
    const t = { id: uuid(), title: parsed.title, priority: priorityChoice || parsed.priority, completed: false };
    setTasks(prev => [t, ...prev]);
    setInput("");
    setPriorityChoice("normal");
  };

  const toggleComplete = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    ding();
  };

  const removeTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  const filtered = useMemo(() => {
    const q = filter.q.toLowerCase();
    return tasks
      .filter(t => (q ? t.title.toLowerCase().includes(q) : true))
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }, [tasks, filter]);

  const PriorityBadge = ({ p }) => (
    <Badge className={`ml-2 rounded px-2 py-0.5 text-[10px] sm:text-[9px] font-normal opacity-70 ${p === "urgent" ? "bg-red-500/70 text-white" : p === "low" ? "bg-slate-500/60 text-white" : "bg-amber-500/70 text-white"}`}>{PRIORITY_LABELS[p]}</Badge>
  );

  const TaskRow = ({ t }) => (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border shadow-xl backdrop-blur-md bg-white/70 ${t.completed ? "opacity-50" : ""}`}>
      <Button size="icon" variant="outline" onClick={() => toggleComplete(t.id)} className="rounded-full min-w-[48px] min-h-[48px] sm:min-w-[44px] sm:min-h-[44px]">
        <Check className="w-6 h-6 sm:w-5 sm:h-5" />
      </Button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-base sm:text-lg text-slate-900 break-words leading-snug">{t.title}</span>
          <PriorityBadge p={t.priority} />
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => removeTask(t.id)} className="text-red-500 hover:text-red-700 min-w-[48px] min-h-[48px] sm:min-w-[44px] sm:min-h-[44px]">
        <Trash2 className="w-6 h-6 sm:w-5 sm:h-5" />
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-4 sm:p-6 text-white">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"><Sparkles className="w-7 h-7 sm:w-6 sm:h-6 text-white" /></div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-pink-200 to-purple-300 bg-clip-text text-transparent">To‑Do Coach</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ex: Préparer un rapport demain 14h" onKeyDown={(e) => { if (e.key === "Enter") addTask(); }} className="h-14 sm:h-12 text-base sm:text-lg rounded-xl border-0 shadow-inner bg-white/20 backdrop-blur text-white placeholder:text-slate-300" />

          <div className="flex gap-2">
            <Select value={priorityChoice} onValueChange={setPriorityChoice}>
              <SelectTrigger className="flex-1 sm:w-44 h-14 sm:h-12 rounded-xl bg-white/20 text-white border-0 text-base sm:text-lg">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">⚡ {PRIORITY_LABELS["urgent"]}</SelectItem>
                <SelectItem value="normal">⏳ {PRIORITY_LABELS["normal"]}</SelectItem>
                <SelectItem value="low">🌙 {PRIORITY_LABELS["low"]}</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={addTask} className="h-14 sm:h-12 px-6 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-xl shadow-md hover:shadow-lg text-base sm:text-lg whitespace-nowrap"><Plus className="w-6 h-6 sm:mr-2" /><span className="hidden sm:inline">Ajouter</span></Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-base">
          <Search className="w-5 h-5" />
          <Input placeholder="Rechercher" className="pl-8 h-12 sm:h-10 bg-white/20 border-0 backdrop-blur rounded-xl text-white placeholder:text-slate-300 text-base" value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} />
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border-0 shadow-lg">
          <CardContent className="p-3 sm:p-5 space-y-3 sm:space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center text-slate-300 py-8 sm:py-6 italic text-base sm:text-lg">Aucune tâche. Ajoute-en une ✨</div>
            ) : (
              <div className="flex flex-col gap-3 sm:gap-4">
                <AnimatePresence initial={false}>
                  {filtered.map(t => <TaskRow key={t.id} t={t} />)}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-xs sm:text-sm text-slate-300 text-center px-2">Stockage local uniquement • Interface claire et lisible • Classement automatique par priorité ✨</div>
      </div>
    </div>
  );
}
