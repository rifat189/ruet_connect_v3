import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../App';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';

const ChatWidget: React.FC = () => {
    const { user } = useAuth();
    const { onlineUsers, sendMessage, messages, activeConversationId, setActiveConversationId } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [localMessage, setLocalMessage] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);

    if (!user) return null;

    // Filter online users (excluding self)
    const onlineList = onlineUsers.filter(id => id !== user.id);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeConversationId || !localMessage.trim()) return;
        sendMessage(activeConversationId, localMessage);
        setLocalMessage('');
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform z-50 hover:bg-indigo-700"
            >
                <MessageCircle size={28} />
                {onlineList.length > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                )}
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden transition-all ${isMinimized ? 'w-72 h-14' : 'w-80 sm:w-96 h-[32rem]'}`}>
            {/* Header */}
            <div className="bg-indigo-600 p-4 flex items-center justify-between shrink-0 cursor-pointer" onClick={() => !activeConversationId && setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <MessageCircle className="text-white" size={20} />
                        {onlineList.length > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-600"></span>}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Messaging</h3>
                        {!isMinimized && activeConversationId && <span className="text-[10px] text-indigo-200 block">Active Conversation</span>}
                    </div>
                </div>
                <div className="flex items-center gap-2 text-indigo-200">
                    <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="hover:text-white"><Minimize2 size={16} /></button>
                    <button onClick={() => setIsOpen(false)} className="hover:text-white"><X size={18} /></button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {activeConversationId ? (
                        /* Chat Interface */
                        <div className="flex flex-col flex-grow h-full bg-slate-50">
                            <div className="p-2 bg-white border-b border-slate-100 flex items-center gap-2">
                                <button onClick={() => setActiveConversationId(null)} className="text-xs font-bold text-slate-500 hover:text-indigo-600 px-2">Back</button>
                                <span className="text-xs font-bold text-slate-900 truncate">Chat with {activeConversationId}</span>
                            </div>

                            <div className="flex-grow overflow-y-auto p-4 space-y-3">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm font-medium ${msg.sender === user.id
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                                <input
                                    className="flex-grow bg-slate-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="Type a message..."
                                    value={localMessage}
                                    onChange={e => setLocalMessage(e.target.value)}
                                />
                                <button type="submit" className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* Active Users List */
                        <div className="flex-grow overflow-y-auto p-2 bg-white">
                            <div className="p-3">
                                <input
                                    placeholder="Search users..."
                                    className="w-full bg-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="px-4 py-2 text-[10px] uppercase font-black text-slate-400 tracking-widest">Online Now</p>
                                {onlineList.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-xs italic">No one else is online</div>
                                ) : (
                                    onlineList.map(uid => (
                                        <div
                                            key={uid}
                                            onClick={() => setActiveConversationId(uid)}
                                            className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors mx-2"
                                        >
                                            <div className="relative">
                                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-black text-xs">
                                                    {uid.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700">User {uid.slice(0, 6)}...</p>
                                                <p className="text-[10px] text-emerald-600 font-bold">Active now</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ChatWidget;
