import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { aiApi } from "@/api/aiApi";
import { useAIStore } from "@/store/useAIStore";
import Button from "@/components/ui/Button";

const SUGGESTIONS = [
  "How much did I spend on food this month?",
  "Am I on track with my budget?",
  "What's my biggest expense category?",
  "How can I save more money?",
];

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        className="w-2 h-2 rounded-full bg-text-muted"
      />
    ))}
  </div>
);

export default function AIChatBot() {
  const { isChatOpen, toggleChat, messages, addMessage, isTyping, setTyping } = useAIStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const mutation = useMutation({
    mutationFn: (message) => aiApi.chat(message),
    onMutate: (message) => {
      addMessage({ role: "user", content: message });
      setTyping(true);
    },
    onSuccess: ({ data }) => {
      setTyping(false);
      addMessage({ role: "ai", content: data.data.reply });
    },
    onError: () => {
      setTyping(false);
      addMessage({ role: "ai", content: "Sorry, I'm having trouble connecting. Please try again." });
    },
  });

  const sendMessage = (msg) => {
    const text = (msg || input).trim();
    if (!text) return;
    setInput("");
    mutation.mutate(text);
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className="fixed bottom-20 right-5 md:bottom-6 z-50 w-14 h-14 rounded-full bg-primary shadow-glow flex items-center justify-center text-white"
      >
        <AnimatePresence mode="wait">
          {isChatOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot size={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-36 right-5 md:bottom-24 z-50 w-80 sm:w-96 h-[520px] glass-card flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-surface/80">
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-text-primary text-sm">FlowFin AI</p>
                <p className="text-xs text-accent">● Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="bg-surface-2 rounded-2xl rounded-tl-none p-3 text-sm text-text-primary max-w-[80%]">
                    Hi! I'm your FlowFin AI assistant 👋 Ask me anything about your finances!
                  </div>
                  <div className="space-y-2 mt-4">
                    <p className="text-xs text-text-muted">Try asking:</p>
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="w-full text-left text-xs px-3 py-2 rounded-lg bg-surface-2 hover:bg-primary/10 hover:text-primary text-text-muted transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-surface-2 text-text-primary rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-surface-2 rounded-2xl rounded-tl-none">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ask about your finances..."
                className="flex-1 bg-surface-2 border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
              />
              <Button
                size="icon"
                onClick={() => sendMessage()}
                disabled={!input.trim() || mutation.isPending}
              >
                <Send size={16} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
