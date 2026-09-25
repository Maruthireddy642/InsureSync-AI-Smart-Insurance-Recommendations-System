import { Send, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import api from "../api/client";

const SUGGESTIONS = [
  "What does my deductible mean?",
  "How is my Insurance Recommendation Score calculated?",
  "How do I file a claim?",
  "What is prior authorization?",
];

export default function Advisor() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm your InsureSync AI advisor. Ask me about your policy, claims, prior authorizations, or your recommendation score.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text) {
    const message = text ?? input;
    if (!message.trim()) return;
    setMessages((m) => [...m, { role: "user", content: message }]);
    setInput("");
    setSending(true);
    try {
      const { data } = await api.post("/advisor/chat", { message });
      setMessages((m) => [...m, { role: "assistant", content: data.reply, source: data.source }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't process that just now." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-5">
        <div className="eyebrow text-ledger-dark mb-1.5 flex items-center gap-1.5">
          <Sparkles size={12} /> LLM-Powered Advisory
        </div>
        <h1 className="font-display text-3xl text-ink">Ask Your Advisor</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shrink-0 mr-2.5 mt-0.5">
                <ShieldCheck size={14} className="text-ledger-glow" />
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-ledger text-white rounded-tr-sm"
                  : "bg-white border border-line text-ink rounded-tl-sm shadow-card"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-2 pl-10">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-light animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-light animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-light animate-bounce" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-line text-slate hover:border-ledger hover:text-ledger-dark hover:bg-ledger-light/40 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your policy, claims, or coverage..."
            className="flex-1 border border-line rounded-full px-4 py-2.5 text-sm focus:border-ledger focus:ring-2 focus:ring-ledger/10 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={sending}
            className="w-11 h-11 shrink-0 rounded-full bg-ledger text-white flex items-center justify-center hover:bg-ledger-dark transition-all disabled:opacity-60 shadow-sm"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}