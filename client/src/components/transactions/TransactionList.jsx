import TransactionCard from "./TransactionCard";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TransactionList({
  transactions = [],
  isLoading,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] w-full" />
        ))}
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <EmptyState
        icon="💸"
        title="No transactions found"
        description="Add your first transaction or adjust your filters"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {transactions.map((t, i) => (
          <TransactionCard
            key={t._id}
            transaction={t}
            index={i}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-text-muted">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
