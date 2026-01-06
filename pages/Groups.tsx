import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Group } from '../types';
import { useAuth } from '../App';
import { Users, Search, Plus, Lock, Globe, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Groups: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroup, setNewGroup] = useState({
        name: '',
        description: '',
        privacy: 'Public' as 'Public' | 'Private'
    });

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        const data = await db.getGroups();
        setGroups(data);
        setLoading(false);
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await db.createGroup(newGroup);
            setShowCreateModal(false);
            setNewGroup({ name: '', description: '', privacy: 'Public' });
            fetchGroups();
        } catch (error) {
            console.error("Failed to create group", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <div className="max-w-5xl mx-auto px-4 pt-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <Users className="text-blue-600" size={32} /> Communities
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">Connect with peers in focused interest groups.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-slate-200"
                    >
                        <Plus size={20} /> Create Group
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map(group => (
                            <div
                                key={group.id}
                                onClick={() => navigate(`/groups/${group.id}`)}
                                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black ${group.privacy === 'Private' ? 'bg-slate-900' : 'bg-blue-600'}`}>
                                        {group.name.charAt(0)}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1 ${group.privacy === 'Private' ? 'bg-slate-50 text-slate-600 border-slate-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                        {group.privacy === 'Private' ? <Lock size={10} /> : <Globe size={10} />}
                                        {group.privacy}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{group.name}</h3>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6 line-clamp-2 flex-grow">{group.description}</p>
                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                                    <span className="text-xs font-bold text-slate-400">{group.members.length} Members</span>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Create New Group</h2>
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Group Name</label>
                                <input
                                    className="w-full px-5 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                                    placeholder="e.g. AI Researchers"
                                    value={newGroup.name}
                                    onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Description</label>
                                <textarea
                                    className="w-full px-5 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 font-medium resize-none h-32"
                                    placeholder="What is this group about?"
                                    value={newGroup.description}
                                    onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Privacy</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setNewGroup({ ...newGroup, privacy: 'Public' })}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${newGroup.privacy === 'Public' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'}`}
                                    >
                                        Public
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewGroup({ ...newGroup, privacy: 'Private' })}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${newGroup.privacy === 'Private' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 text-slate-400'}`}
                                    >
                                        Private
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3.5 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    Create Group
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groups;
