
import { User, Job, Event, MentorshipRequest, Post, Notice, Group, AppNotification } from './types';
import { MOCK_USERS, MOCK_JOBS, MOCK_EVENTS } from './constants';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.API_URL || 'http://localhost:5000';

export const db = {
  init: () => {
    // No-op for now
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const res = await fetch(`${API_URL}/users`);
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getJobs: async (): Promise<Job[]> => {
    try {
      const res = await fetch(`${API_URL}/jobs`);
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getEvents: async (): Promise<Event[]> => {
    try {
      const res = await fetch(`${API_URL}/events`);
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getPosts: async (): Promise<Post[]> => {
    try {
      const res = await fetch(`${API_URL}/posts`);
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },



  login: async (email: string, pass: string): Promise<{ user: User, token: string } | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.token) localStorage.setItem('token', data.token);
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  register: async (user: Omit<User, 'id'>): Promise<{ user: User, token: string } | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.token) localStorage.setItem('token', data.token);
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  addJob: async (job: Omit<Job, 'id'>) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(job)
    });
    return await res.json();
  },

  async joinEvent(eventId: string): Promise<Event | null> {
    const res = await fetch(`${API_URL}/events/${eventId}/join`, {
      method: 'POST',
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
    if (!res.ok) return null;
    const event = await res.json();
    return { ...event, id: event._id };
  },

  addEvent: async (event: Omit<Event, 'id'>) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(event)
    });
    return await res.json();
  },

  applyToJob: async (jobId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'x-auth-token': token }
    });
    return await res.json();
  },

  getAppliedJobs: async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    const res = await fetch(`${API_URL}/jobs/applied`, {
      headers: { 'x-auth-token': token }
    });
    if (!res.ok) return [];
    return await res.json();
  },

  getMentors: async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    const res = await fetch(`${API_URL}/mentorship/mentors`, {
      headers: { 'x-auth-token': token }
    });
    if (!res.ok) return [];
    return await res.json();
  },

  becomeMentor: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await fetch(`${API_URL}/mentorship/become`, {
      method: 'POST',
      headers: { 'x-auth-token': token }
    });
    return await res.json();
  },

  requestMentorship: async (mentorId: string, topic: string, message: string) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await fetch(`${API_URL}/mentorship/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ mentorId, topic, message })
    });
    return await res.json();
  },

  getMentorshipRequests: async () => {
    const token = localStorage.getItem('token');
    if (!token) return { incoming: [], outgoing: [] };
    const res = await fetch(`${API_URL}/mentorship/requests`, {
      headers: { 'x-auth-token': token }
    });
    if (!res.ok) return { incoming: [], outgoing: [] };
    return await res.json();
  },

  acceptMentorship: async (requestId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await fetch(`${API_URL}/mentorship/requests/${requestId}/accept`, {
      method: 'POST',
      headers: { 'x-auth-token': token }
    });
    return await res.json();
  },

  rejectMentorship: async (requestId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await fetch(`${API_URL}/mentorship/requests/${requestId}/reject`, {
      method: 'POST',
      headers: { 'x-auth-token': token }
    });
    return await res.json();
  },

  addPost: async (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'likedBy'>) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(post)
    });
    return await res.json();
  },

  likePost: async (postId: string, userId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`${API_URL}/posts/like/${postId}`, {
      method: 'PUT',
      headers: { 'x-auth-token': token }
    });
  },

  addComment: async (postId: string, comment: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`${API_URL}/posts/comment/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(comment)
    });
  },

  connectUser: async (userId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await fetch(`${API_URL}/users/connect/${userId}`, {
      method: 'POST',
      headers: { 'x-auth-token': token }
    });
    return await res.json();
  },

  getPendingConnections: async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
      const res = await fetch(`${API_URL}/users/requests/pending`, {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.map((r: any) => ({
        ...r,
        id: r.id || r._id,
        sender: {
          ...r.sender,
          id: r.sender.id || r.sender._id
        }
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getOutgoingRequests: async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
      const res = await fetch(`${API_URL}/users/requests/outgoing`, {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  acceptConnection: async (requestId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await fetch(`${API_URL}/users/accept/${requestId}`, {
      method: 'POST',
      headers: { 'x-auth-token': token }
    });
    return await res.json();
  },

  rejectConnection: async (requestId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await fetch(`${API_URL}/users/reject/${requestId}`, {
      method: 'POST',
      headers: { 'x-auth-token': token }
    });
    return await res.json();
  },

  getConnections: async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
      const res = await fetch(`${API_URL}/users/connections`, {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  // Stubs
  addNotification: async (n: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          userId: n.userId,
          type: n.type || 'general',
          content: n.message || n.title, // Map message/title to content
          relatedId: n.relatedId
        })
      });
    } catch (e) {
      console.error(e);
    }
  },

  getNotifications: async (userId?: string): Promise<AppNotification[]> => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) return [];
      const data = await res.json();
      // Map backend notification to AppNotification interface if needed
      // Assuming AppNotification has { id, title? (map content), type, isRead, timestamp? (createdAt) }
      return data.map((n: any) => ({
        id: n.id,
        title: n.content,
        message: n.content,
        type: n.type,
        isRead: n.isRead,
        timestamp: n.createdAt,
        link: n.relatedId ? `/profile/${n.relatedId}` : undefined // Simple heuristic
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  markNotificationRead: async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'x-auth-token': token }
    });
  },

  clearAllNotifications: async (uid: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`${API_URL}/notifications`, {
      method: 'DELETE',
      headers: { 'x-auth-token': token }
    });
  },

  deleteJob: async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`${API_URL}/jobs/${id}`, {
      method: 'DELETE',
      headers: { 'x-auth-token': token }
    });
  },

  deleteUser: async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: { 'x-auth-token': token }
    });
  },

  updateUser: async (u: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/users/${u.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(u)
      });
      return await res.json();
    } catch (e) {
      console.error(e);
    }
  },
  async getNotices(): Promise<Notice[]> {
    const res = await fetch(`${API_URL}/notices`, {
      headers: {
        'x-auth-token': localStorage.getItem('token') || ''
      }
    });
    if (!res.ok) return [];
    const notices = await res.json();
    return notices.map((n: any) => ({ ...n, id: n._id }));
  },

  async addNotice(notice: Omit<Notice, 'id' | 'createdAt' | 'postedBy' | 'postedByUserId'>): Promise<Notice> {
    const res = await fetch(`${API_URL}/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token') || ''
      },
      body: JSON.stringify(notice)
    });
    const newNotice = await res.json();
    return { ...newNotice, id: newNotice._id };
  },

  async getGroups(): Promise<Group[]> {
    const res = await fetch(`${API_URL}/groups`, {
      headers: {
        'x-auth-token': localStorage.getItem('token') || ''
      }
    });
    if (!res.ok) return [];
    const groups = await res.json();
    return groups.map((g: any) => ({ ...g, id: g._id }));
  },

  async createGroup(group: Partial<Group>): Promise<Group> {
    const res = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token') || ''
      },
      body: JSON.stringify(group)
    });
    const newGroup = await res.json();
    return { ...newGroup, id: newGroup._id };
  },

  async joinGroup(groupId: string): Promise<Group | null> {
    const res = await fetch(`${API_URL}/groups/${groupId}/join`, {
      method: 'POST',
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
    if (!res.ok) return null;
    const group = await res.json();
    return { ...group, id: group._id };
  },

  async getGroupPosts(groupId: string): Promise<Post[]> {
    const res = await fetch(`${API_URL}/groups/${groupId}/posts`, {
      headers: { 'x-auth-token': localStorage.getItem('token') || '' }
    });
    if (!res.ok) return [];
    const posts = await res.json();
    return posts.map((p: any) => ({
      ...p,
      id: p._id,
      timestamp: new Date(p.createdAt).getTime()
    }));
  }
};
