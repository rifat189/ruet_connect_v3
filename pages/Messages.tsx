import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../App';
import { Send, User as UserIcon, Search, MoreVertical, Phone, Video } from 'lucide-react';
import { db } from '../db';
import { User } from '../types';

const Messages: React.FC = () => {
    const { user } = useAuth();
    const { onlineUsers, sendMessage, messages, activeConversationId, setActiveConversationId } = useSocket();
    const [localMessage, setLocalMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        // Fetch all users to list in sidebar
        const fetchUsers = async () => {
            const u = await db.getUsers();
            setUsers(u.filter(u => u.id !== user?.id));
        };
        fetchUsers();
    }, [user]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeConversationId || !localMessage.trim()) return;
        sendMessage(activeConversationId, localMessage);
        setLocalMessage('');
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeUser = users.find(u => u.id === activeConversationId);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-80px)]">
            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 h-full overflow-hidden flex">

                {/* Sidebar */}
                <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-xl font-black text-slate-900 mb-4">Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                                placeholder="Search people..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto p-3 space-y-1">
                        {filteredUsers.map(u => (
                            <div
                                key={u.id}
                                onClick={() => setActiveConversationId(u.id)}
                                className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${activeConversationId === u.id ? 'bg-white shadow-md border border-slate-100' : 'hover:bg-indigo-50/50'
                                    }`}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-black text-sm">
                                        {u.avatar ? <img src={u.avatar} className="w-10 h-10 rounded-full object-cover" /> : u.name.charAt(0)}
                                    </div>
                                    {onlineUsers.includes(u.id) && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-900 text-sm truncate">{u.name}</h3>
                                    <p className="text-xs text-slate-500 truncate">{u.position || u.department}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-grow flex flex-col bg-white relative">
                    {activeConversationId ? (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                        {activeUser?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-lg">{activeUser?.name || 'Unknown User'}</h3>
                                        {onlineUsers.includes(activeConversationId) ? (
                                            <p className="text-xs font-bold text-emerald-500">Online Now</p>
                                        ) : (
                                            <p className="text-xs font-bold text-slate-400">Offline</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl hover:text-indigo-600 transition-colors"><Phone size={20} /></button>
                                    <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl hover:text-indigo-600 transition-colors"><Video size={20} /></button>
                                    <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl hover:text-indigo-600 transition-colors"><MoreVertical size={20} /></button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-grow overflow-y-auto p-8 space-y-6">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <Send size={32} className="text-indigo-300" />
                                        </div>
                                        <p className="font-bold text-slate-400">No messages yet</p>
                                        <p className="text-sm text-slate-400">Start the conversation with {activeUser?.name}!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-md px-6 py-3 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm ${msg.sender === user?.id
                                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                                    : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-bl-none'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-6 border-t border-slate-50">
                                <form onSubmit={handleSend} className="flex gap-4">
                                    <input
                                        className="flex-grow bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-50 font-medium transition-all"
                                        placeholder="Type a message..."
                                        value={localMessage}
                                        onChange={e => setLocalMessage(e.target.value)}
                                    />
                                    <button type="submit" className="px-8 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                        Send
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 animate-bounce">
                                <Send size={40} className="text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Your Messages</h2>
                            <p className="text-slate-500 max-w-sm">Select a conversation from the sidebar to start chatting with your network.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
