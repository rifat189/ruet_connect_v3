
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { User } from '../types';
import { useAuth } from '../App';
import { Search, Filter, MapPin, Building2, UserPlus, Linkedin, Github, GraduationCap, X, Trophy, ArrowRight, User as UserIcon, CheckCircle, Clock } from 'lucide-react';

const Network: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, refreshUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [connections, setConnections] = useState<User[]>([]);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<string[]>([]); // Array of receiver IDs
  const [activeTab, setActiveTab] = useState<'discover' | 'connections'>('discover');

  useEffect(() => {
    const fetchData = async () => {
      const [allUsers, pending, outgoing, myConnections] = await Promise.all([
        db.getUsers(),
        db.getPendingConnections(),
        db.getOutgoingRequests(),
        db.getConnections()
      ]);
      setUsers(allUsers);
      setPendingRequests(pending);
      setOutgoingRequests(outgoing.map((r: any) => r.receiverId));
      setConnections(myConnections);
    };
    fetchData();
  }, []);

  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    users.forEach(user => {
      user.skills?.forEach(skill => skillsSet.add(skill));
    });
    return Array.from(skillsSet).sort();
  }, [users]);

  const displayUsers = useMemo(() => {
    const source = activeTab === 'discover' ? users : connections;

    return source.filter(user => {
      // Hide own profile
      if (authUser && user.id === authUser.id) return false;

      // In Discover, don't show already connected users
      if (activeTab === 'discover' && authUser?.connections?.includes(user.id)) return false;

      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.batch.includes(searchTerm) ||
        user.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSkill = selectedSkill ? user.skills?.includes(selectedSkill) : true;

      return matchesSearch && matchesSkill;
    });
  }, [users, connections, activeTab, authUser, searchTerm, selectedSkill]);

  const handleConnect = async (e: React.MouseEvent, userName: string, userId: string) => {
    e.stopPropagation();
    if (authUser) {
      await db.connectUser(userId);
      await refreshUser();
      setOutgoingRequests(prev => [...prev, userId]);
    }
    setShowToast(`Connection request sent to ${userName}!`);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleAccept = async (e: React.MouseEvent, requestId: string, senderName: string) => {
    e.stopPropagation();
    await db.acceptConnection(requestId);
    await refreshUser();

    // Refresh all relevant states
    const [pending, outgoing, myConnections, allUsers] = await Promise.all([
      db.getPendingConnections(),
      db.getOutgoingRequests(),
      db.getConnections(),
      db.getUsers()
    ]);

    setPendingRequests(pending);
    setOutgoingRequests(outgoing.map((r: any) => r.receiverId));
    setConnections(myConnections);
    setUsers(allUsers);

    setShowToast(`You are now connected with ${senderName}!`);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleReject = async (e: React.MouseEvent, requestId: string) => {
    e.stopPropagation();
    await db.rejectConnection(requestId);
    const pending = await db.getPendingConnections();
    setPendingRequests(pending);
  };



  const navigateToProfile = (id: string) => {
    navigate(`/profile/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative">
      {showToast && (
        <div className="fixed top-24 right-8 z-[100] animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle size={16} />
            </div>
            <p className="font-medium text-sm">{showToast}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Network Directory</h1>
          <p className="text-slate-500">Connect with members of the RUET family.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 md:px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'discover' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Discover
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`flex-1 md:px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'connections' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              My Network ({connections.length})
            </button>
          </div>

          <div className="relative flex-grow md:w-64 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {pendingRequests.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <UserPlus size={16} className="text-blue-500" /> Pending Requests ({pendingRequests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={req.sender.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div>
                    <p className="font-black text-slate-900 text-sm leading-tight">{req.sender.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{req.sender.department} • {req.sender.batch}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleAccept(e, req.id, req.sender.name)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={(e) => handleReject(e, req.id)}
                    className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-sm font-semibold text-slate-400 mr-2 whitespace-nowrap">Popular Skills:</span>
          <button
            onClick={() => setSelectedSkill(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${selectedSkill === null
              ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
              : 'bg-white border-gray-100 text-slate-500 hover:border-gray-300'
              }`}
          >
            All Members
          </button>
          {allSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border flex items-center gap-2 ${selectedSkill === skill
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                : 'bg-white border-gray-100 text-slate-500 hover:border-gray-300'
                }`}
            >
              {skill}
              {selectedSkill === skill && <X size={14} />}
            </button>
          ))}
        </div>
      </div>

      {displayUsers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Search size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{activeTab === 'discover' ? 'No RUETians found' : 'No connections yet'}</h3>
          <p className="text-slate-500">{activeTab === 'discover' ? 'Try adjusting your search or skill filters.' : 'Start connecting with alumni and students to grow your network.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => navigateToProfile(user.id)}
              className="bg-white rounded-[1.5rem] p-6 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col group cursor-pointer relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-[100%] z-0 transition-transform group-hover:scale-150 duration-500 will-change-transform"></div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-cyan-400">
                    <img src={user.avatar} className="w-full h-full rounded-full object-cover border-4 border-white" alt={user.name} />
                  </div>
                  <span className={`absolute bottom-1 right-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-white shadow-sm ${user.role === 'Alumni' ? 'bg-slate-900 text-white' :
                    user.role === 'Teacher' ? 'bg-orange-500 text-white' :
                      'bg-white text-slate-700'
                    }`}>
                    {user.role}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-1 leading-tight group-hover:text-blue-600 transition-colors">{user.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4 line-clamp-1">{user.department} • {user.batch}</p>

                {/* Quick Skills */}
                <div className="flex flex-wrap justify-center gap-2 mb-6 h-12 overflow-hidden content-start">
                  {user.skills?.slice(0, 3).map(skill => (
                    <span key={skill} className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100">
                      {skill}
                    </span>
                  ))}
                  {(user.skills?.length || 0) > 3 && (
                    <span className="px-2.5 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-lg border border-slate-100">+{user.skills!.length - 3}</span>
                  )}
                </div>

                <div className="mt-auto w-full pt-4 border-t border-slate-50 flex gap-3">
                  {authUser?.connections?.includes(user.id) ? (
                    <button
                      className="flex-1 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-wide cursor-default flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={14} /> Connected
                    </button>
                  ) : pendingRequests.some(r => r.sender.id === user.id) ? (
                    <button
                      onClick={(e) => {
                        const req = pendingRequests.find(r => r.sender.id === user.id);
                        if (req) handleAccept(e, req.id, user.name);
                      }}
                      className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wide hover:bg-blue-700 transition-all flex items-center justify-center gap-2 animate-pulse"
                    >
                      <UserPlus size={14} /> Accept
                    </button>
                  ) : outgoingRequests.includes(user.id) ? (
                    <button
                      className="flex-1 py-2.5 bg-orange-50 text-orange-600 rounded-xl text-xs font-black uppercase tracking-wide cursor-default flex items-center justify-center gap-2"
                    >
                      <Clock size={14} /> Sent
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleConnect(e, user.name, user.id)}
                      className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-wide hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus size={14} /> Connect
                    </button>
                  )}
                  <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-colors">
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Network;
