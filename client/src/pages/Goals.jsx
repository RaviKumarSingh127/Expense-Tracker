import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Target, Trash2, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/api/axiosInstance";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { formatDate } from "@/utils/dateHelpers";

const EMOJIS = ["🎯", "🏠", "✈️", "🚗", "💍", "📱", "🎓", "💻", "🏋️", "🌴"];

export default function Goals() {
  const qc = useQueryClient();
  const { format } = useCurrencyFormat();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [form, setForm] = useState({ title: "", emoji: "🎯", targetAmount: "", targetDate: "" });
  const [contribution, setContribution] = useState({ amount: "", note: "" });

  const { data: goals, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => api.get("/goals").then((r) => r.data.data.goals),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post("/goals", { ...data, targetAmount: Number(data.targetAmount) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal created! 🎯");
      setIsFormOpen(false);
      setForm({ title: "", emoji: "🎯", targetAmount: "", targetDate: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/goals/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goals"] }); toast.success("Goal deleted"); },
  });

  const contributeMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.post(`/goals/${id}/contribute`, { amount: Number(data.amount), note: data.note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Contribution added! 💰");
      setContributeGoal(null);
      setContribution({ amount: "", note: "" });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Savings Goals</h2>
          <p className="text-sm text-text-muted">{goals?.length || 0} active goals</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus size={16} />
          New Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(goals || []).map((goal, idx) => {
            const pct = Math.min(goal.progressPercent || 0, 100);
            const circumference = 2 * Math.PI * 40;
            const daysLeft = Math.max(
              Math.round((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)),
              0
            );

            return (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <Card className="group space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{goal.emoji}</span>
                      <div>
                        <p className="font-bold text-text-primary">{goal.title}</p>
                        <p className="text-xs text-text-muted">Due {formatDate(goal.targetDate)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(goal._id)}
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Circular progress */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#1E1E2E" strokeWidth="8" />
                        <motion.circle
                          cx="50" cy="50" r="40" fill="none"
                          stroke={goal.isCompleted ? "#06D6A0" : "#7C3AED"}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset: circumference - (pct / 100) * circumference }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-lg font-bold ${goal.isCompleted ? "text-accent" : "text-primary"}`}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-text-muted">Saved</p>
                      <p className="text-lg font-bold text-accent">{format(goal.savedAmount)}</p>
                      <p className="text-sm text-text-muted">of {format(goal.targetAmount)}</p>
                      {!goal.isCompleted && (
                        <p className="text-xs text-text-muted">{daysLeft} days left</p>
                      )}
                    </div>
                  </div>

                  {goal.isCompleted ? (
                    <div className="text-center py-2 rounded-xl bg-accent/10 text-accent text-sm font-medium">
                      🎉 Goal Achieved!
                    </div>
                  ) : (
                    <>
                      {goal.monthlyTarget > 0 && (
                        <p className="text-xs text-text-muted text-center">
                          Need {format(goal.monthlyTarget)}/month to reach goal
                        </p>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => setContributeGoal(goal)}
                      >
                        <PlusCircle size={14} />
                        Add Contribution
                      </Button>
                    </>
                  )}
                </Card>
              </motion.div>
            );
          })}

          {!(goals?.length) && (
            <div className="col-span-3 text-center py-16">
              <p className="text-5xl mb-3">🎯</p>
              <p className="text-lg font-semibold text-text-primary">No goals yet</p>
              <p className="text-text-muted text-sm">Set a savings goal and work towards it!</p>
            </div>
          )}
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Create Savings Goal">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">Choose Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setForm({ ...form, emoji: e })}
                  className={`text-2xl p-2 rounded-xl transition-all ${form.emoji === e ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-surface-2"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <Input label="Goal Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Emergency Fund, New Laptop..." />
          <Input label="Target Amount (₹)" type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} placeholder="100000" min="1" />
          <Input label="Target Date" type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} min={new Date().toISOString().slice(0, 10)} />
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button
              className="flex-1"
              disabled={!form.title || !form.targetAmount || !form.targetDate}
              onClick={() => createMutation.mutate(form)}
              isLoading={createMutation.isPending}
            >
              Create Goal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Contribute Modal */}
      <Modal isOpen={!!contributeGoal} onClose={() => setContributeGoal(null)} title={`Add to: ${contributeGoal?.title}`}>
        <div className="space-y-4">
          <Input label="Amount (₹)" type="number" value={contribution.amount} onChange={(e) => setContribution({ ...contribution, amount: e.target.value })} placeholder="1000" min="1" />
          <Input label="Note (optional)" value={contribution.note} onChange={(e) => setContribution({ ...contribution, note: e.target.value })} placeholder="Monthly savings..." />
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setContributeGoal(null)}>Cancel</Button>
            <Button
              className="flex-1"
              disabled={!contribution.amount}
              onClick={() => contributeMutation.mutate({ id: contributeGoal._id, ...contribution })}
              isLoading={contributeMutation.isPending}
            >
              Add ₹{contribution.amount || 0}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
