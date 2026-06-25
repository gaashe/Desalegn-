"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/ui/Modal";
import { Mail, MailOpen, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Message {
  id: string;
  subject: string;
  content: string;
  senderName: string;
  senderRole: string;
  receiverName: string;
  receiverRole: string;
  senderId: string;
  receiverId: string;
  read: boolean;
  createdAt: string;
}

export default function ParentMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [viewMsg, setViewMsg] = useState<Message | null>(null);
  const [form, setForm] = useState({ receiverId: "", subject: "", content: "" });

  useEffect(() => {
    if (!user) return;
    fetch(`/api/messages?userId=${user.userId}`)
      .then((r) => r.json())
      .then(setMessages);
  }, [user]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, senderId: user?.userId }),
    });
    setShowCompose(false);
    setForm({ receiverId: "", subject: "", content: "" });
    fetch(`/api/messages?userId=${user?.userId}`)
      .then((r) => r.json())
      .then(setMessages);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 text-sm mt-1">Communicate with teachers and school</p>
        </div>
        <button onClick={() => setShowCompose(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm">
          <Send size={18} /> Compose
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {messages.map((msg) => (
          <div key={msg.id} className="p-4 hover:bg-gray-50 cursor-pointer flex items-start gap-3" onClick={() => setViewMsg(msg)}>
            {msg.read ? <MailOpen size={18} className="text-gray-400 mt-0.5" /> : <Mail size={18} className="text-emerald-600 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className={`text-sm truncate ${msg.read ? "text-gray-700" : "font-semibold text-gray-900"}`}>{msg.subject}</h4>
                <span className="text-xs text-gray-400 shrink-0">{formatDate(msg.createdAt)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {msg.senderId === user?.userId ? `To: ${msg.receiverName}` : `From: ${msg.senderName}`}
              </p>
              <p className="text-xs text-gray-400 mt-1 truncate">{msg.content}</p>
            </div>
          </div>
        ))}
        {messages.length === 0 && <p className="text-center text-gray-400 py-8">No messages</p>}
      </div>

      <Modal open={showCompose} onClose={() => setShowCompose(false)} title="Compose Message">
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient User ID</label>
            <input required value={form.receiverId} onChange={(e) => setForm({ ...form, receiverId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" placeholder="Enter teacher or admin user ID" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea required rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowCompose(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium">Send</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewMsg} onClose={() => setViewMsg(null)} title={viewMsg?.subject || ""}>
        {viewMsg && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>From: {viewMsg.senderName} ({viewMsg.senderRole})</span>
              <span>{formatDate(viewMsg.createdAt)}</span>
            </div>
            <div className="text-sm text-gray-500">To: {viewMsg.receiverName} ({viewMsg.receiverRole})</div>
            <hr />
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewMsg.content}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
