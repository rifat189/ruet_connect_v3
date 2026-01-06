import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../db';
import { Group, Post } from '../types';
import { useAuth } from '../App';
import { Users, Lock, Globe, ArrowLeft, Plus, MessageSquare, Heart, Image as ImageIcon } from 'lucide-react';

const GroupView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    const [group, setGroup] = useState<Group | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isMember, setIsMember] = useState(false);
    const [loading, setLoading] = useState(true);

    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImage, setNewPostImage] = useState('');

    useEffect(() => {
        if (id) {
            fetchGroupData();
        }
    }, [id]);

    useEffect(() => {
        if (group && authUser) {
            setIsMember(group.members.includes(authUser.id));
        }
    }, [group, authUser]);

    const fetchGroupData = async () => {
        setLoading(true);
        const groups = await db.getGroups();
        const foundGroup = groups.find(g => g.id === id);

        if (foundGroup) {
            setGroup(foundGroup);
            // Fetch posts if public or member
            const groupPosts = await db.getGroupPosts(id!);
            setPosts(groupPosts);
        }
        setLoading(false);
    };

    const handleJoinLeave = async () => {
        if (!id) return;

        const updatedGroup = await db.joinGroup(id);
        if (updatedGroup) {
            setGroup(updatedGroup);
            setIsMember(!isMember); // Toggle local state optimistically or based on response
        }
    };

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        if (authUser && id) {
            const newPost = {
                userId: authUser.id,
                userName: authUser.name,
                userAvatar: authUser.avatar || '',
                userRole: authUser.role,
                content: newPostContent,
                media: newPostImage ? [{ type: 'image' as const, url: newPostImage }] : [],
                groupId: id
            };

            await db.addPost(newPost);
            setNewPostContent('');
            setNewPostImage('');
            // Refresh posts
            const groupPosts = await db.getGroupPosts(id);
            setPosts(groupPosts);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12 min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-2xl font-bold text-slate-400">Group Not Found</h2>
                <button onClick={() => navigate('/groups')} className="mt-4 text-blue-600 font-bold hover:underline">Back to Groups</button>
            </div>
        );
    }

    const canViewPosts = group.privacy === 'Public' || isMember;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-16 z-30">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <button onClick={() => navigate('/groups')} className="text-slate-400 hover:text-slate-600 font-bold flex items-center gap-2 text-sm mb-6 transition-colors">
                        <ArrowLeft size={16} /> Back to Communities
                    </button>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black ${group.privacy === 'Private' ? 'bg-slate-900' : 'bg-blue-600'}`}>
                                {group.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{group.name}</h1>
                                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                    <span className="flex items-center gap-1.5"><Users size={14} /> {group.members.length} Members</span>
                                    <span className="flex items-center gap-1.5 capitalize"><Globe size={14} /> {group.privacy} Group</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleJoinLeave}
                            className={`px-8 py-3 rounded-xl font-black text-sm transition-all shadow-lg ${isMember
                                    ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                }`}
                        >
                            {isMember ? 'Leave Group' : 'Join Group'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">About</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{group.description}</p>
                    </div>
                </div>

                {/* Feed */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Create Post */}
                    {isMember && (
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                            <form onSubmit={handlePostSubmit}>
                                <textarea
                                    placeholder={`Share something with ${group.name}...`}
                                    className="w-full bg-slate-50 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-100 text-sm font-medium resize-none min-h-[100px]"
                                    value={newPostContent}
                                    onChange={e => setNewPostContent(e.target.value)}
                                />
                                <div className="mt-4 flex items-center justify-between">
                                    <button type="button" className="text-slate-400 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-blue-50">
                                        <ImageIcon size={20} />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newPostContent.trim()}
                                        className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-black transition-all"
                                    >
                                        Post
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Posts List */}
                    {!canViewPosts ? (
                        <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                            <Lock size={48} className="mx-auto text-slate-200 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Private Content</h3>
                            <p className="text-slate-400">Join this group to participate in discussions.</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold italic">No posts yet. Be the first to share!</p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                    <img src={post.userAvatar || `https://ui-avatars.com/api/?name=${post.userName}`} className="w-10 h-10 rounded-full bg-slate-100" />
                                    <div>
                                        <h4 className="font-bold text-slate-900">{post.userName}</h4>
                                        <p className="text-xs font-bold text-slate-400">{new Date(post.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-4">{post.content}</p>
                                {post.media && post.media.length > 0 && (
                                    <div className="rounded-2xl overflow-hidden mb-6">
                                        <img src={post.media[0].url} className="w-full h-auto" />
                                    </div>
                                )}
                                <div className="pt-4 border-t border-slate-50 flex items-center gap-6">
                                    <button className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-bold">
                                        <Heart size={18} /> {post.likes}
                                    </button>
                                    <button className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm font-bold">
                                        <MessageSquare size={18} /> {post.comments.length}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupView;
