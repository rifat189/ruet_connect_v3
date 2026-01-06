import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Notice } from '../types';
import { useAuth } from '../App';
import { Bell, Calendar, Pin, AlertCircle, Plus } from 'lucide-react';

const Notices: React.FC = () => {
    const { user } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newNotice, setNewNotice] = useState({
        title: '',
        content: '',
        category: 'General' as Notice['category']
    });

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        setLoading(true);
        const data = await db.getNotices();
        setNotices(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNotice.title || !newNotice.content) {
            alert("Please fill in both title and content!");
            return;
        }

        await db.addNotice(newNotice);
        setNewNotice({ title: '', content: '', category: 'General' });
        setShowForm(false);
        fetchNotices();
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Academic': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Administrative': return 'bg-red-50 text-red-600 border-red-100';
            case 'Event': return 'bg-purple-50 text-purple-600 border-purple-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <div className="max-w-4xl mx-auto px-4 pt-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Bell className="text-blue-600" size={32} /> Notices & Announcements
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">Stay updated with the latest campus news.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-slate-200"
                    >
                        <Plus size={20} /> Post Notice
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl mb-10 animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-xl font-bold mb-6 text-slate-800">Create New Announcement</h3>
                        <div className="space-y-4">
                            <input
                                placeholder="Notice Title"
                                className="w-full px-5 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                                value={newNotice.title}
                                onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                            />
                            <div className="flex gap-4">
                                <select
                                    className="px-5 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                                    value={newNotice.category}
                                    onChange={e => setNewNotice({ ...newNotice, category: e.target.value as any })}
                                >
                                    <option value="General">General</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Administrative">Administrative</option>
                                    <option value="Event">Event</option>
                                </select>
                            </div>
                            <textarea
                                placeholder="Content..."
                                rows={4}
                                className="w-full px-5 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 resize-none font-medium"
                                value={newNotice.content}
                                onChange={e => setNewNotice({ ...newNotice, content: e.target.value })}
                            />
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    Publish Notice
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : notices.length === 0 ? (
                    <div className="text-center p-16 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold italic">No notices posted yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {notices.map(notice => (
                            <div key={notice.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getCategoryColor(notice.category)}`}>
                                            {notice.category}
                                        </span>
                                        <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                                            <Calendar size={12} /> {new Date(notice.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {/* Pin icon or other actions could go here */}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{notice.title}</h3>
                                <p className="text-slate-600 leading-relaxed font-medium">{notice.content}</p>
                                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {notice.postedBy.charAt(0)}
                                        </div>
                                        <span className="text-xs font-bold text-slate-500">{notice.postedBy}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notices;
