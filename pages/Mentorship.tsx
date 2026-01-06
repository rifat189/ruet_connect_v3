
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { useAuth } from '../App';
import { User, MentorshipRequest } from '../types';
import {
  Users, Star, BookOpen, MessageSquare, Check, X, Search,
  ChevronRight, Award, BrainCircuit, Sparkles, Filter
} from 'lucide-react';
import { Icon } from '@iconify/react';

const Mentorship: React.FC = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<User[]>([]);
  const [requests, setRequests] = useState<{ incoming: MentorshipRequest[], outgoing: MentorshipRequest[] }>({ incoming: [], outgoing: [] });
  const [isMentorMode, setIsMentorMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [showRequestModal, setShowRequestModal] = useState<User | null>(null);
  const [requestTopic, setRequestTopic] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [mentorList, requestData] = await Promise.all([
        db.getMentors(),
        db.getMentorshipRequests()
      ]);
      setMentors(mentorList);
      setRequests(requestData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRequestModal) return;

    await db.requestMentorship(showRequestModal.id, requestTopic, requestMessage);
    const updatedRequests = await db.getMentorshipRequests();
    setRequests(updatedRequests);
    setShowRequestModal(null);
    setRequestTopic('');
    setRequestMessage('');
  };

  const handleAccept = async (requestId: string) => {
    await db.acceptMentorship(requestId);
    const updatedRequests = await db.getMentorshipRequests();
    setRequests(updatedRequests);
  };

  const handleReject = async (requestId: string) => {
    await db.rejectMentorship(requestId);
    const updatedRequests = await db.getMentorshipRequests();
    setRequests(updatedRequests);
  };

  const handleBecomeMentor = async () => {
    await db.becomeMentor();
    // Refresh page or update local user state if possible
    window.location.reload();
  };

  const allSkills = Array.from(new Set(mentors.flatMap(m => m.mentoringSkills || [])));

  const filteredMentors = mentors.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = selectedSkill ? m.mentoringSkills?.includes(selectedSkill) : true;
    return matchesSearch && matchesSkill && (user ? m.id !== user.id : true);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-[3rem] p-12 text-white mb-16 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
          <Award size={400} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest text-blue-200 mb-6">
            <BrainCircuit size={14} /> Knowledge Exchange
          </div>
          <h1 className="text-5xl font-black mb-6 tracking-tight leading-none">Find Your <span className="text-blue-400">Mentor.</span></h1>
          <p className="text-blue-100 text-lg mb-10 font-medium leading-relaxed">Connect with experienced RUETians who are ready to share their expertise, guidance, and industry insights to help you grow your career.</p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setIsMentorMode(!isMentorMode)}
              className="px-8 py-4 bg-white text-blue-900 rounded-2xl font-black text-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-xl shadow-blue-950/20"
            >
              <Icon icon="solar:users-group-rounded-bold" width="18" height="18" />
              {isMentorMode ? 'Find a Mentor' : 'Mentor Dashboard'}
            </button>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <button
                onClick={handleBecomeMentor}
                className="relative px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-black text-sm text-white hover:bg-white/20 transition-all"
              >
                Become a Mentor
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {isMentorMode ? (
          <div className="lg:col-span-12 space-y-12">
            {/* Incoming Requests */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mentorship Requests</h2>
              </div>

              {requests.incoming.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 py-16 text-center">
                  <Users size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold tracking-tight">No incoming requests at the moment</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {requests.incoming.map(req => (
                    <div key={req.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex items-center gap-4 mb-6">
                        <img src={(req.menteeId as any).avatar} className="w-12 h-12 rounded-xl object-cover shadow-sm bg-slate-50" />
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{(req.menteeId as any).name}</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(req.menteeId as any).department} • Batch {(req.menteeId as any).batch}</p>
                        </div>
                      </div>
                      <div className="space-y-4 mb-8">
                        <div>
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-1">Topic</span>
                          <p className="text-sm font-bold text-slate-700">{req.topic}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Message</span>
                          <p className="text-sm text-slate-500 italic">"{req.message}"</p>
                        </div>
                      </div>
                      {req.status === 'pending' ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAccept(req.id)}
                            className="flex-grow py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <div className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-center ${req.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                          }`}>
                          {req.status}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <>
            {/* Sidebar Filters */}
            <aside className="lg:col-span-3 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-24">
                <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
                  <Filter size={20} className="text-blue-600" /> Filters
                </h3>

                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Topic Area</label>
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    >
                      <option value="">All Expertise</option>
                      {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="pt-8 border-t border-slate-50">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Active Mentorships</h4>
                    {requests.outgoing.filter(r => r.status === 'accepted').length === 0 ? (
                      <p className="text-[11px] text-slate-400 font-medium">None active yet. Start by exploring mentors!</p>
                    ) : (
                      <div className="space-y-4">
                        {requests.outgoing.filter(r => r.status === 'accepted').map(r => (
                          <div key={r.id} className="flex items-center gap-3">
                            <img src={(r.mentorId as any).avatar} className="w-8 h-8 rounded-lg object-cover" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{(r.mentorId as any).name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{r.topic}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* Mentor List */}
            <main className="lg:col-span-9 space-y-8">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or department..."
                  className="w-full bg-white pl-16 pr-8 py-5 rounded-[2rem] border border-slate-100 shadow-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 opacity-20">
                  <BrainCircuit size={48} className="animate-pulse mb-4 text-blue-600" />
                  <p className="text-sm font-black uppercase tracking-widest">Calibrating Experts...</p>
                </div>
              ) : filteredMentors.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                  <Users size={48} className="mx-auto text-slate-100 mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No mentors found</h3>
                  <p className="text-slate-500 text-sm">Try adjusting your topic filter or search term.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMentors.map(mentor => (
                    <div key={mentor.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all relative overflow-hidden">
                      {/* Accent */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[4rem] group-hover:bg-blue-100/50 transition-colors -z-0"></div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-8">
                          <div className="flex gap-4">
                            <div className="relative">
                              <img src={mentor.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-lg bg-slate-50 border-2 border-white" />
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center border-2 border-white">
                                <Star size={12} fill="currentColor" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-slate-900 mt-1">{mentor.name}</h3>
                              <p className="text-xs font-bold text-blue-600">{mentor.position || 'Alumni'} @ {mentor.company || 'RUET Family'}</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8 line-clamp-2">
                          {mentor.mentorshipBio || `Helping students understand ${mentor.mentoringSkills?.slice(0, 2).join(' and ') || 'the industry.'}`}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                          {mentor.mentoringSkills?.map(s => (
                            <span key={s} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              {s}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => setShowRequestModal(mentor)}
                          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-100"
                        >
                          Request Guidance
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </>
        )}
      </div>

      {/* REQUEST MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowRequestModal(null)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 animate-in zoom-in slide-in-from-bottom-8 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles size={120} />
            </div>

            <header className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mentorship Request</h2>
              <p className="text-slate-500 text-sm font-medium">To <span className="text-blue-600 font-bold">{showRequestModal.name}</span></p>
            </header>

            <form onSubmit={handleRequest} className="space-y-6 relative z-10">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Focus Area</label>
                <input
                  required
                  placeholder="e.g. System Design, Career Guidance"
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-bold text-sm"
                  value={requestTopic}
                  onChange={(e) => setRequestTopic(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Your Message</label>
                <textarea
                  required
                  placeholder="Briefly explain what you'd like to learn..."
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-medium text-sm h-32 resize-none"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-grow py-5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Send Invitation</button>
                <button type="button" onClick={() => setShowRequestModal(null)} className="px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentorship;
