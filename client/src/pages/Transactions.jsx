import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { transactionApi } from "@/api/transactionApi";
import { useTransactionStore } from "@/store/useTransactionStore";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionFilter from "@/components/transactions/TransactionFilter";
import TransactionForm from "@/components/transactions/TransactionForm";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { exportTransactions } from "@/utils/exportHelpers";

export default function Transactions() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const { filters, setPage } = useTransactionStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => transactionApi.getAll(filters).then((r) => r.data),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => transactionApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Transaction deleted");
    },
  });

  const handleEdit = (t) => {
    setEditTransaction(t);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditTransaction(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">All Transactions</h2>
          <p className="text-sm text-text-muted">{data?.pagination?.total || 0} records</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus size={16} />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <TransactionFilter onExport={(fmt) => exportTransactions(filters, fmt)} />

      {/* List */}
      <TransactionList
        transactions={data?.data || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onEdit={handleEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
        onPageChange={setPage}
      />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editTransaction ? "Edit Transaction" : "Add Transaction"}
      >
        <TransactionForm transaction={editTransaction} onClose={handleCloseForm} />
      </Modal>
    </div>
  );
}
