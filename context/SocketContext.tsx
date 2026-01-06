import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '../App';
import { db } from '../db';
import { Message } from '../types';

interface SocketContextType {
    socket: Socket | null;
    onlineUsers: string[];
    messages: Message[];
    sendMessage: (receiverId: string, content: string) => void;
    activeConversationId: string | null;
    setActiveConversationId: (id: string | null) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [messages, setMessages] = useState<Message[]>([]); // Current conversation messages
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            const newSocket = io('http://localhost:5000');
            setSocket(newSocket);

            newSocket.emit('join', user.id);

            newSocket.on('onlineUsers', (users: string[]) => {
                setOnlineUsers(users);
            });

            newSocket.on('receiveMessage', (message: any) => {
                // If the message belongs to the active conversation, add it
                if (activeConversationId && (message.sender === activeConversationId || message.receiver === activeConversationId)) {
                    setMessages(prev => [...prev, { ...message, id: message._id, timestamp: new Date(message.createdAt).getTime() }]);
                }
                // TODO: Else, maybe trigger a notification or unread badge usage
            });

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) socket.disconnect();
            setSocket(null);
        }
    }, [user, activeConversationId]);

    // Fetch messages when active conversation changes
    useEffect(() => {
        if (activeConversationId && user) {
            const fetchHistory = async () => {
                try {
                    const res = await fetch(`http://localhost:5000/api/messages/${activeConversationId}`, {
                        headers: { 'x-auth-token': localStorage.getItem('token') || '' }
                    });
                    const data = await res.json();
                    setMessages(data.map((m: any) => ({ ...m, id: m._id, timestamp: new Date(m.createdAt).getTime() })));
                } catch (err) {
                    console.error("Failed to fetch messages", err);
                }
            };
            fetchHistory();
        }
    }, [activeConversationId, user]);

    const sendMessage = (receiverId: string, content: string) => {
        if (socket && user) {
            socket.emit('sendMessage', {
                sender: user.id,
                receiver: receiverId,
                content
            });
            // Optimistically add to local state if viewing this convo
            if (activeConversationId === receiverId) {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(), // temp id
                    sender: user.id,
                    receiver: receiverId,
                    content,
                    isRead: false,
                    timestamp: Date.now()
                }]);
            }
        }
    };

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, messages, sendMessage, activeConversationId, setActiveConversationId }}>
            {children}
        </SocketContext.Provider>
    );
};
