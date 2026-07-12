import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import {
  Sparkles,
  Send,
  Trash2,
  GraduationCap,
  RefreshCw,
  BookMarked,
  Ship,
  Code2,
  Trees,
  MapPin,
  Plus,
  MessageSquare,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  User
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO String
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string; // ISO String
}

// Pre-defined study templates for quick injection
const STUDY_TEMPLATES = [
  {
    title: "Programação de Peixes",
    description: "Aprenda listas em Python utilizando os peixes dos nossos rios.",
    icon: Code2,
    prompt: "Me ensine a criar e percorrer listas em Python usando exemplos com peixes da Amazônia, como o Tambaqui, Pirarucu e Matrinxã.",
    category: "Programação"
  },
  {
    title: "Física de Voadeiras",
    description: "Calcule a velocidade de um barco contra a correnteza do Solimões.",
    icon: Ship,
    prompt: "Gostaria de resolver um problema de física sobre velocidade relativa. Use como exemplo uma voadeira navegando contra a correnteza do Rio Solimões.",
    category: "Física"
  }
];

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [apiKeyStatus, setApiKeyStatus] = useState<{ hasApiKey: boolean; checked: boolean }>({
    hasApiKey: true,
    checked: false
  });

  const [selectedModel, setSelectedModel] = useState<"gemini-3.5-flash" | "gemini-3.1-flash-lite">((() => {
    const saved = localStorage.getItem("nortistaia_selected_model");
    return (saved === "gemini-3.1-flash-lite" || saved === "gemini-3.5-flash") ? saved : "gemini-3.5-flash";
  }) as any);

  useEffect(() => {
    localStorage.setItem("nortistaia_selected_model", selectedModel);
  }, [selectedModel]);

  // Scroll Ref for Chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    checkApiKey();

    const savedSessions = localStorage.getItem("nortistaia_sessions") || localStorage.getItem("manausia_sessions");
    const savedActiveId = localStorage.getItem("nortistaia_active_id") || localStorage.getItem("manausia_active_id");

    let loadedSessions: ChatSession[] = [];
    if (savedSessions) {
      try {
        loadedSessions = JSON.parse(savedSessions);
      } catch (e) {
        console.error("Error parsing saved sessions", e);
      }
    }

    if (loadedSessions.length === 0) {
      // Create first initial session
      const initialId = Date.now().toString();
      const firstSession: ChatSession = {
        id: initialId,
        title: "Nova Conversa",
        messages: [
          {
            id: "welcome",
            role: "assistant",
            content: "Olá, mana/mano! Seja muito bem-vindo à **NortistaIA Chat**! 🍃\n\nEu sou sua Inteligência Artificial especializada na nossa bela **Amazônia Legal** e em toda a **Região Norte**.\n\nAqui, podemos conversar sobre qualquer assunto: ciência, programação, física, história e nossa rica cultura regional. Meu objetivo principal é **ensinar** de um jeito caloroso, prático e conectado à nossa realidade.\n\nEscolha um dos temas sugeridos abaixo para começarmos ou faça sua pergunta! Bora aprender?",
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      };
      loadedSessions = [firstSession];
      setSessions(loadedSessions);
      setActiveSessionId(initialId);
      localStorage.setItem("nortistaia_sessions", JSON.stringify(loadedSessions));
      localStorage.setItem("nortistaia_active_id", initialId);
    } else {
      setSessions(loadedSessions);
      if (savedActiveId && loadedSessions.some((s) => s.id === savedActiveId)) {
        setActiveSessionId(savedActiveId);
      } else {
        setActiveSessionId(loadedSessions[0].id);
        localStorage.setItem("nortistaia_active_id", loadedSessions[0].id);
      }
    }
  }, []);

  // Save sessions to localStorage on changes
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("nortistaia_sessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem("nortistaia_active_id", activeSessionId);
    }
  }, [activeSessionId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId, isLoading]);

  const checkApiKey = async () => {
    try {
      const response = await fetch("/api/config");
      const data = await response.json();
      setApiKeyStatus({ hasApiKey: data.hasApiKey, checked: true });
    } catch (e) {
      console.error("Error checking API key status", e);
      setApiKeyStatus({ hasApiKey: false, checked: true });
    }
  };

  const createNewChat = () => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: "Nova Conversa",
      messages: [
        {
          id: "welcome_" + newSessionId,
          role: "assistant",
          content: "Nova conversa iniciada! O que tu queres aprender ou criar de bom hoje, mano/mana?",
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newSessionId);
    setIsMobileSidebarOpen(false); // Auto-close sidebar on mobile
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!id) return;

    if (!window.confirm("Tem certeza que deseja apagar essa conversa, rapaz?")) {
      return;
    }

    if (sessions.length <= 1) {
      // If it's the only session, we reset its messages to the welcoming state
      const resetSession: ChatSession = {
        id: id,
        title: "Nova Conversa",
        messages: [
          {
            id: "welcome_" + id,
            role: "assistant",
            content: "Olá, mana/mano! Seja muito bem-vindo à **NortistaIA Chat**! 🍃\n\nEu sou sua Inteligência Artificial especializada na nossa bela **Amazônia Legal** e em toda a **Região Norte**.\n\nAqui, podemos conversar sobre qualquer assunto: ciência, programação, física, história e nossa rica cultura regional. Meu objetivo principal é **ensinar** de um jeito caloroso, prático e conectado à nossa realidade.\n\nEscolha um dos temas sugeridos abaixo para começarmos ou faça sua pergunta! Bora aprender?",
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      };
      setSessions([resetSession]);
      setActiveSessionId(id);
      return;
    }

    const isDeletingActive = id === activeSessionId;
    const filteredSessions = sessions.filter((s) => s.id !== id);

    setSessions(filteredSessions);

    if (isDeletingActive) {
      const nextActiveId = filteredSessions[0].id;
      setActiveSessionId(nextActiveId);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || isLoading || !activeSessionId) return;

    if (!textToSend) {
      setInput("");
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString()
    };

    // Update session messages and automatically generate title if it is "Nova Conversa"
    let isFirstUserMsg = false;
    const updatedSessions = sessions.map((session) => {
      if (session.id === activeSessionId) {
        const hasUserMsgs = session.messages.some((m) => m.role === "user");
        let newTitle = session.title;
        if (!hasUserMsgs || session.title === "Nova Conversa" || session.title === "Nova conversa iniciada!") {
          newTitle = messageText.length > 28 ? messageText.slice(0, 28) + "..." : messageText;
          isFirstUserMsg = true;
        }
        return {
          ...session,
          title: newTitle,
          messages: [...session.messages, userMsg]
        };
      }
      return session;
    });

    setSessions(updatedSessions);
    setIsLoading(true);

    const currentSession = updatedSessions.find((s) => s.id === activeSessionId);
    const chatHistory = currentSession ? currentSession.messages : [];

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: chatHistory.map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();
      if (!response.ok) {
        const errObj = new Error(data.message || data.error || "Erro ao obter resposta do modelo");
        (errObj as any).status = response.status;
        (errObj as any).customMessage = data.message;
        throw errObj;
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.text,
        timestamp: new Date().toISOString()
      };

      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [...session.messages, assistantMsg]
            };
          }
          return session;
        })
      );
    } catch (error: any) {
      console.error("Error in sending message:", error);
      
      let errorText = "";
      if (error.customMessage) {
        errorText = error.customMessage;
      } else {
        const errorStr = String(error.message || error || "").toLowerCase();
        const isQuota = errorStr.includes("quota") || errorStr.includes("rate") || errorStr.includes("429") || errorStr.includes("resource_exhausted") || error.status === 429;
        
        if (isQuota) {
          errorText = `⚠️ **Limite de requisições atingido!**\n\nEita, mano/mana! Parece que o limite de perguntas do plano gratuito do modelo atual (**${selectedModel === "gemini-3.5-flash" ? "Gemini 3.5 Flash" : "Gemini 3.1 Flash Lite"}**) foi atingido temporariamente. 🍃\n\n💡 **Dica de ouro:** Você pode **mudar o modelo no topo da página** para o **Gemini 3.1 Flash Lite** (ou vice-versa) para continuar conversando sem precisar esperar! Ou, se preferir, basta **aguardar cerca de 15 a 20 segundos** e tentar de novo. ⏱️`;
        } else {
          errorText = `❌ **Ocorreu um erro ao obter resposta da NortistaIA:**\n\n${error.message || "Por favor, verifique se seu servidor está ativo ou recarregue a página."}\n\n*Dica: Se a chave GEMINI_API_KEY estiver ausente, adicione-a no painel Configurações > Secrets do AI Studio.*`;
        }
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorText,
        timestamp: new Date().toISOString()
      };

      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [...session.messages, errorMsg]
            };
          }
          return session;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  return (
    <div className="h-screen bg-stone-50 text-stone-800 flex overflow-hidden font-sans antialiased">
      
      {/* SIDEBAR: Desktop Persistent / Mobile Slide-over */}
      <aside
        className={`bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-emerald-100 flex-col shrink-0 border-r border-emerald-950 z-30 transition-all duration-300 ${
          isSidebarOpen ? "w-64 md:flex" : "w-0 md:hidden"
        } ${isMobileSidebarOpen ? "fixed inset-y-0 left-0 w-64 flex" : "hidden md:flex"}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trees className="w-5 h-5 text-emerald-300 animate-pulse" />
            <span className="font-bold font-display tracking-tight text-white text-base">NortistaIA Chat</span>
          </div>
          {/* Close mobile sidebar */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-emerald-800/40 rounded text-emerald-300"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Collapse sidebar desktop button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="hidden md:block p-1 hover:bg-emerald-800/40 rounded text-emerald-300 cursor-pointer"
            title="Fechar barra lateral"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={createNewChat}
            className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl border border-emerald-700/50 shadow-sm flex items-center justify-center gap-2 transition cursor-pointer text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Chat</span>
          </button>
        </div>

        {/* Sessions List (Recentes) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-2 pb-2 text-[10px] font-bold tracking-widest text-emerald-300/60 uppercase font-mono">
            Conversas Recentes
          </div>
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setIsMobileSidebarOpen(false); // Close mobile menu
                }}
                className={`group flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer text-xs ${
                  isActive
                    ? "bg-emerald-800/60 text-white font-semibold border-l-2 border-emerald-400"
                    : "hover:bg-emerald-900/40 text-emerald-100/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-emerald-300" : "text-emerald-400/70"}`} />
                  <span className="truncate leading-none">{session.title}</span>
                </div>
                
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className="md:opacity-0 md:group-hover:opacity-100 opacity-100 p-1 hover:bg-emerald-850 rounded text-emerald-400 hover:text-red-300 transition shrink-0 ml-1"
                  title="Apagar Conversa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-emerald-900/60 bg-emerald-950/40 text-emerald-300/70 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span>Conectado à Amazônia</span>
          </div>
          <div className="text-[10px] italic">
            Lema: &ldquo;O conhecimento nasce perto de quem aprende.&rdquo;
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-stone-900/40 z-20 md:hidden"
        />
      )}

      {/* MAIN WORKSPACE SECTION */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        
        {/* TOP COMPACT APP HEADER */}
        <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white py-3 px-4 shadow-md border-b border-emerald-950 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Show sidebar toggle buttons */}
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hidden md:block p-1.5 hover:bg-emerald-800/40 rounded-lg text-emerald-100 transition cursor-pointer"
                title="Abrir barra lateral"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}
            
            {/* Mobile hamburger menu */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 hover:bg-emerald-800/40 rounded-lg text-emerald-100 transition cursor-pointer"
              title="Abrir menu de conversas"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-bold font-display tracking-tight text-white text-lg">
                {activeSession ? activeSession.title : "NortistaIA Chat"}
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider hidden sm:inline-block">
                v2.5 Pro
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/60 px-2 py-1 rounded-xl shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse hidden sm:inline" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                className="bg-transparent text-emerald-100 hover:text-white text-xs outline-none cursor-pointer font-medium transition"
                title="Selecionar modelo de Inteligência Artificial"
              >
                <option value="gemini-3.5-flash" className="bg-emerald-900 text-white font-sans text-xs">
                  Gemini 3.5 Flash (Padrão)
                </option>
                <option value="gemini-3.1-flash-lite" className="bg-emerald-900 text-white font-sans text-xs">
                  Gemini 3.1 Flash Lite (Livre / Sem Limites)
                </option>
              </select>
            </div>
            <span className="hidden lg:flex text-xs bg-emerald-950/50 text-emerald-200 border border-emerald-800/60 px-3 py-1 rounded-full items-center gap-1.5 font-medium">
              <GraduationCap className="w-3.5 h-3.5" />
              Professor &amp; Pesquisador
            </span>
            <button
              onClick={(e) => deleteSession(activeSessionId || "", e)}
              className="p-1.5 hover:bg-emerald-800/50 text-emerald-100 hover:text-red-300 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold border border-emerald-700/50 shadow-xs"
              title="Apagar/Limpar conversa atual"
            >
              <Trash2 className="w-3.5 h-3.5 text-emerald-300 hover:text-red-400 transition" />
              <span className="hidden sm:inline">Limpar Chat</span>
            </button>
            {apiKeyStatus.checked && !apiKeyStatus.hasApiKey && (
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium animate-bounce">
                ⚠️ Sem Chave API
              </span>
            )}
          </div>
        </header>

        {/* CONTENT CHAT LOG & VIEWPORT */}
        <main className="flex-1 flex flex-col justify-between overflow-hidden relative">
          
          {/* Missing API Key Warning bar inside active layout */}
          {apiKeyStatus.checked && !apiKeyStatus.hasApiKey && (
            <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs shrink-0">
              <div className="flex gap-3">
                <span className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">⚠️</span>
                <div>
                  <h4 className="font-semibold text-amber-900 text-sm">Chave do Gemini API ausente</h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Olá! Adicione sua chave em <strong>Settings &gt; Secrets</strong> no menu do AI Studio para ativar as respostas da Inteligência Artificial.
                  </p>
                </div>
              </div>
              <button
                onClick={checkApiKey}
                className="text-xs bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
              >
                <RefreshCw className="w-3 h-3" /> Verificar
              </button>
            </div>
          )}

          {/* Messages Flow Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      
                      {/* Avatar Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        message.role === "user" 
                          ? "bg-stone-100 text-stone-600 border border-stone-200" 
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}>
                        {message.role === "user" ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Trees className="w-4 h-4" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className="flex flex-col">
                        <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm ${
                          message.role === "user"
                            ? "bg-emerald-800 text-white rounded-tr-none"
                            : "bg-stone-50 text-stone-800 border border-stone-100 rounded-tl-none"
                        }`}>
                          {message.role === "assistant" ? (
                            <div className="markdown-body">
                              <Markdown>{message.content}</Markdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          )}
                        </div>
                        
                        {/* Meta info */}
                        <span className={`text-[10px] text-stone-400 mt-1 font-mono ${
                          message.role === "user" ? "text-right" : "text-left"
                        }`}>
                          {message.role === "user" ? "Você" : "NortistaIA"} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Loader */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%] items-start">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Trees className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-emerald-50/50 border border-emerald-100/60 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm text-stone-600 text-xs flex items-center gap-2">
                      <div className="flex space-x-1.5">
                        <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="font-medium italic text-emerald-800 font-mono">NortistaIA está formulando o exemplo...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* BOT INPUT & QUICK STUDY TEMPLATES PANEL */}
          <div className="p-4 shrink-0">
            <div className="max-w-3xl mx-auto space-y-4">
              
              {/* Quick Study Templates - shown only on fresh chats */}
              {messages.length === 1 && !isLoading && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2 font-mono">
                    💡 TOQUE EM UM TEMA PARA COMEÇAR A AULA
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STUDY_TEMPLATES.map((tmpl, idx) => {
                      const IconComponent = tmpl.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(tmpl.prompt)}
                          className="text-left bg-stone-50/50 border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/20 p-3 rounded-xl transition shadow-xs group flex gap-3 items-start cursor-pointer"
                        >
                          <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-100 transition shrink-0">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-bold text-xs text-stone-800 group-hover:text-emerald-900 transition font-display">
                                {tmpl.title}
                              </h5>
                              <span className="text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.2 rounded-full font-mono font-medium">
                                {tmpl.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{tmpl.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Text Area Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pergunte sobre programação, matemática, física com exemplos amazônicos..."
                  disabled={isLoading}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition disabled:opacity-50 font-sans"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white p-3 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
                  title="Enviar Mensagem"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Under bar footer */}
              <div className="flex items-center justify-between text-[10px] text-stone-400">
                <span>Pressione Enter para enviar</span>
                <span className="flex items-center gap-1 font-mono">
                  <BookMarked className="w-3 h-3 text-emerald-600" />
                  Respostas orientadas pela cultura e ciência nortista
                </span>
              </div>

            </div>
          </div>

        </main>

        {/* Small copyright footer */}
        <footer className="bg-stone-100 border-t border-stone-200 py-3 text-center text-[10px] text-stone-500 shrink-0">
          <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p>© 2026 NortistaIA Chat — &ldquo;O conhecimento nasce perto de quem aprende.&rdquo;</p>
            <a
              href="https://ai.studio/build"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-800 transition font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" /> Powered by AI Studio
            </a>
          </div>
        </footer>

      </div>

    </div>
  );
}
