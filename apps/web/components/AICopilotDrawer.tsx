"use client";

import React, { useState } from "react";
import { Investigation, AIQueryResponse, AIToolCall } from "@crypto-tracer/types";
import { queryAI } from "../lib/api";
import {
  Bot,
  Send,
  Sparkles,
  Terminal,
  ShieldCheck,
  AlertCircle,
  X,
  ChevronRight,
} from "lucide-react";

interface Props {
  investigation: Investigation | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectSuggestion?: (query: string) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: AIToolCall[];
  disclaimers?: string[];
}

export const AICopilotDrawer: React.FC<Props> = ({
  investigation,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello Investigator. I am your AntiGravity Forensic Intelligence Copilot. I can trace funds across multiple hops, identify mixer and bridge interactions, evaluate risk factors, and prepare subpoena dossier briefs. What would you like to investigate?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const suggestions = [
    "Find interactions with mixers",
    "Where did these funds eventually end up?",
    "Explain why this wallet has a high risk score",
    "Trace this wallet forward 6 hops",
    "Show all wallets connected to this cluster",
  ];

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || !investigation || isLoading) return;

    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response: AIQueryResponse = await queryAI(investigation.id, text);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: response.answer,
          toolCalls: response.toolCallsExecuted,
          disclaimers: response.disclaimers,
        },
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "An error occurred while communicating with the forensic intelligence layer. Please retry.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-surface/95 backdrop-blur-2xl border-l border-gray-800 shadow-2xl z-50 flex flex-col justify-between">
      {/* Header */}
      <div className="h-16 px-6 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Forensic AI Copilot
            </h3>
            <p className="text-[10px] text-gray-400">
              Deterministic Tool Orchestrator & Evidence Synthesizer
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand-600 text-white rounded-br-none shadow-lg shadow-brand-600/20 font-medium"
                  : "bg-gray-900/90 border border-gray-800/90 text-gray-200 rounded-bl-none shadow-xl"
              }`}
            >
              {/* Markdown formatted content */}
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Tool Execution Transparency */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-800/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-400 uppercase tracking-wide">
                    <Terminal className="w-3 h-3" />
                    <span>Deterministic Tool Execution ({msg.toolCalls.length})</span>
                  </div>
                  {msg.toolCalls.map((tc, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-black/40 border border-gray-800 font-mono text-[10px] text-gray-400"
                    >
                      <span className="text-brand-300 font-bold">{tc.tool}()</span>: {tc.reasoning}
                    </div>
                  ))}
                </div>
              )}

              {/* Disclaimers */}
              {msg.disclaimers && (
                <div className="mt-2 text-[10px] text-gray-500 italic">
                  * {msg.disclaimers[0]}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-brand-400 p-3 bg-gray-900/50 rounded-xl border border-gray-800 w-fit animate-pulse">
            <Bot className="w-4 h-4 animate-spin" />
            <span>Analyzing blockchain graph & executing deterministic tools...</span>
          </div>
        )}
      </div>

      {/* Suggested Prompts & Input Box */}
      <div className="p-4 border-t border-gray-800 bg-surface/80 space-y-3">
        {/* Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-gray-900 border border-gray-800 text-[11px] text-gray-300 hover:text-white hover:border-brand-500 transition whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-brand-400" />
              <span>{s}</span>
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask forensic questions (e.g. Find first known exchange...)"
            className="flex-1 bg-black/50 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white shadow-lg shadow-brand-600/30 transition shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
