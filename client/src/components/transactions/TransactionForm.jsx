import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { transactionApi } from "@/api/transactionApi";
import { useAIAutocomplete } from "@/hooks/useAIAutocomplete";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { CATEGORY_META } from "@/utils/exportHelpers";

const CATEGORIES = Object.keys(CATEGORY_META);
const PAYMENT_METHODS = ["upi", "cash", "card", "netbanking", "other"];

export default function TransactionForm({ transaction, onClose }) {
  const qc = useQueryClient();
  const isEdit = !!transaction;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({ mode: "onChange",
    defaultValues: {
      title: transaction?.title || "",
      amount: transaction?.amount || "",
      type: transaction?.type || "expense",
      category: transaction?.category || "",
      date: transaction?.date ? transaction.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      paymentMethod: transaction?.paymentMethod || "other",
      description: transaction?.description || "",
      tags: transaction?.tags?.join(", ") || "",
      isRecurring: transaction?.isRecurring || false,
      recurringInterval: transaction?.recurringInterval || "",
    },
  });

  const title = watch("title");
  const amount = watch("amount");
  const type = watch("type");
  const isRecurring = watch("isRecurring");

  const { suggestedCategory, isLoading: aiLoading } = useAIAutocomplete(title, amount, type);

  useEffect(() => {
    if (suggestedCategory && !watch("category")) {
      setValue("category", suggestedCategory);
    }
  }, [suggestedCategory, setValue, watch]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? transactionApi.update(transaction._id, data) : transactionApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      toast.success(isEdit ? "Transaction updated" : "Transaction added");
      onClose();
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      amount: Number(data.amount),
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      recurringInterval: data.isRecurring ? data.recurringInterval : null,
    };
    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Type toggle */}
      <div className="flex gap-2 p-1 bg-surface-2 rounded-xl">
        {["expense", "income"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setValue("type", t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              type === t
                ? t === "expense"
                  ? "bg-danger text-white"
                  : "bg-accent text-bg"
                : "text-text-muted"
            }`}
          >
            {t === "expense" ? "💸 Expense" : "💰 Income"}
          </button>
        ))}
      </div>

      <Input
        label="Title"
        placeholder="e.g. Swiggy order, Netflix subscription..."
        error={errors.title?.message}
        {...register("title", { required: "Title is required" })}
        rightElement={aiLoading ? (
          <span className="text-xs text-primary animate-pulse">AI...</span>
        ) : null}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Amount (₹)"
          type="number"
          min="0"
          step="0.01"
          placeholder="0"
          error={errors.amount?.message}
          onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
          onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9.]/g, ""); }}
          {...register("amount", { required: "Amount is required", min: { value: 0, message: "Must be positive" }, max: { value: 200000000, message: "Max amount is ₹20 crore" } })}
        />
        <Input
          label="Date"
          type="date"
          {...register("date", { required: "Date is required" })}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text-primary">
          Category
          {suggestedCategory && (
            <span className="ml-2 text-xs text-primary">AI: {suggestedCategory}</span>
          )}
        </label>
        <select
          className="input-base"
          {...register("category", { required: "Category is required" })}
        >
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_META[c].icon} {c}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-xs text-danger">{errors.category.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">Payment Method</label>
          <select className="input-base" {...register("paymentMethod")}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <Input
          label="Tags (comma-separated)"
          placeholder="food, weekend, fun"
          {...register("tags")}
        />
      </div>

      <Input
        label="Description (optional)"
        placeholder="Any notes..."
        {...register("description")}
      />

      {/* Recurring */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded" {...register("isRecurring")} />
          <span className="text-sm font-medium text-text-primary">Recurring transaction</span>
        </label>
        {isRecurring && (
          <select className="input-base" {...register("recurringInterval")}>
            <option value="">Select interval</option>
            {["daily", "weekly", "monthly", "yearly"].map((i) => (
              <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" isLoading={mutation.isPending}>
          {isEdit ? "Update" : "Add Transaction"}
        </Button>
      </div>
    </form>
  );
}
