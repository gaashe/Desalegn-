"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { MessageSquare, Send, Mail, MailOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface MessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  senderRole: string;
  receiverRole: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selected, setSelected] = useState<MessageItem | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ receiverId: "", subject: "", content: "" });

  useEffect(() => {
    if (user) loadMessages();
  }, [user]);

  async function loadMessages() {
    const res = await fetch(`/api/messages?userId=${user?.userId}`);
    const data = await res.json();
    setMessages(data);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, senderId: user?.userId }),
    });
    setShowCompose(false);
    setForm({ receiverId: "", subject: "", content: "" });
    loadMessages();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 text-sm mt-1">{messages.length} messages</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors text-sm"
        >
          <Send size={18} />
          Compose
        </button>
      </div>

      <div className="space-y-3">
        {messages.map((msg) => {
          const isSent = msg.senderId === user?.userId;
          return (
            <div
              key={msg.id}
              onClick={() => setSelected(msg)}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 cursor-pointer hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {msg.read ? (
                      <MailOpen size={16} className="text-gray-400" />
                    ) : (
                      <Mail size={16} className="text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{msg.subject}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isSent ? `To: ${msg.receiverName}` : `From: ${msg.senderName}`}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{msg.content}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-400">{formatDate(msg.createdAt)}</span>
                  <Badge variant={isSent ? "info" : msg.read ? "default" : "success"}>
                    {isSent ? "Sent" : msg.read ? "Read" : "New"}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-50" />
            <p>No messages yet</p>
          </div>
        )}
      </div>

      {/* View Message */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.subject || ""} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-500">From:</span>{" "}
                <span className="font-medium text-gray-900">{selected.senderName}</span>
                <Badge variant="default" className="ml-2">
                  {selected.senderRole}
                </Badge>
              </div>
              <span className="text-gray-400">{formatDate(selected.createdAt)}</span>
            </div>
            <div>
              <span className="text-gray-500 text-sm">To:</span>{" "}
              <span className="font-medium text-sm text-gray-900">{selected.receiverName}</span>
            </div>
            <hr className="border-gray-200" />
            <p className="text-gray-700 whitespace-pre-wrap">{selected.content}</p>
          </div>
        )}
      </Modal>

      {/* Compose */}
      <Modal open={showCompose} onClose={() => setShowCompose(false)} title="Compose Message" size="lg">
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient ID</label>
            <input
              type="text"
              required
              placeholder="e.g., u10, u20"
              value={form.receiverId}
              onChange={(e) => setForm({ ...form, receiverId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              required
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCompose(false)}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <Send size={16} />
              Send
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
