import { Search, SlidersHorizontal, X } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { CATEGORY_META } from "@/utils/exportHelpers";

const CATEGORIES = Object.keys(CATEGORY_META);

export default function TransactionFilter({ onExport }) {
  const { filters, setFilter, resetFilters } = useTransactionStore();
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setFilter("search", debouncedSearch);
  }, [debouncedSearch, setFilter]);

  const hasActiveFilters = filters.type || filters.category?.length || filters.startDate || filters.search;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search transactions..."
            className="input-base pl-9"
          />
        </div>

        {/* Type filter */}
        <select
          value={filters.type}
          onChange={(e) => setFilter("type", e.target.value)}
          className="input-base w-36"
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        {/* Advanced toggle */}
        <Button
          variant={showAdvanced ? "primary" : "ghost"}
          size="md"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          <SlidersHorizontal size={16} />
        </Button>

        {/* Export */}
        <Button variant="ghost" size="md" onClick={() => onExport?.("csv")}>
          Export
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="md" onClick={resetFilters}>
            <X size={16} />
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="glass-card p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">Category</label>
            <select
              value={filters.category?.[0] || ""}
              onChange={(e) => setFilter("category", e.target.value ? [e.target.value] : [])}
              className="input-base text-sm"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">From</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilter("startDate", e.target.value)}
              className="input-base text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">To</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilter("endDate", e.target.value)}
              className="input-base text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Payment</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilter("paymentMethod", e.target.value)}
              className="input-base text-sm"
            >
              <option value="">All methods</option>
              {["upi", "cash", "card", "netbanking"].map((m) => (
                <option key={m} value={m}>{m.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
