import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";
import { aiApi } from "@/api/aiApi";

export const useAIAutocomplete = (title, amount, type) => {
  const [suggestedCategory, setSuggestedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const debouncedTitle = useDebounce(title, 500);

  useEffect(() => {
    if (!debouncedTitle || debouncedTitle.length < 3) {
      setSuggestedCategory("");
      return;
    }

    const categorize = async () => {
      setIsLoading(true);
      try {
        const { data } = await aiApi.categorize({ title: debouncedTitle, amount, type });
        setSuggestedCategory(data.data.category);
      } catch {
        // fail silently — AI is non-critical
      } finally {
        setIsLoading(false);
      }
    };

    categorize();
  }, [debouncedTitle, amount, type]);

  return { suggestedCategory, isLoading };
};
