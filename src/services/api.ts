import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Complaint, Comment } from '../types';

const BASE_URL = null; // Example: 'http://192.168.1.100:8000/api'

// AsyncStorage Keys
const USERS_KEY = '@sas_users';
const COMPLAINTS_KEY = '@sas_complaints_v3';
const SESSION_KEY = '@sas_auth_token';

// Initial Mock Data typed as Complaint[]
const INITIAL_COMPLAINTS: Complaint[] = [];

// Helper to seed initial complaints database
const initMockDB = async (): Promise<void> => {
  try {
    const complaints = await AsyncStorage.getItem(COMPLAINTS_KEY);
    if (!complaints) {
      await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(INITIAL_COMPLAINTS));
    }
    const users = await AsyncStorage.getItem(USERS_KEY);
    if (!users) {
      const defaultUser: User = {
        name: 'Budi Santoso',
        nik: '317409876543210',
        email: 'budi.santoso@warga.id',
        phone: '081234567890',
        password: 'password123'
      };
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify([defaultUser]));
    }
  } catch (e) {
    console.error('Failed to initialize local storage mock DB:', e);
  }
};

initMockDB();

const api = {
  // Authentication
  login: async (emailOrNik: string, password: string): Promise<User> => {
    if (BASE_URL) {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrNik, password })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Login gagal.');
      }
      const data = await response.json();
      await AsyncStorage.setItem(SESSION_KEY, data.token);
      return data.user;
    } else {
      await new Promise(r => setTimeout(r, 800));
      const usersStr = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];
      
      const user = users.find(u => 
        (u.email === emailOrNik || u.nik === emailOrNik) && u.password === password
      );

      if (!user) {
        throw new Error('Email/NIK atau Kata Sandi salah.');
      }

      const mockToken = `mock-jwt-token-for-${user.nik}`;
      await AsyncStorage.setItem(SESSION_KEY, mockToken);
      return user;
    }
  },

  register: async (userData: User): Promise<User> => {
    if (BASE_URL) {
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Pendaftaran gagal.');
      }
      return await response.json();
    } else {
      await new Promise(r => setTimeout(r, 800));
      const usersStr = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];

      if (users.some(u => u.email === userData.email)) {
        throw new Error('Email sudah terdaftar.');
      }
      if (users.some(u => u.nik === userData.nik)) {
        throw new Error('NIK sudah terdaftar.');
      }

      const newUser: User = {
        name: userData.name,
        nik: userData.nik,
        email: userData.email,
        phone: userData.phone,
        password: userData.password
      };

      users.push(newUser);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      return newUser;
    }
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = await AsyncStorage.getItem(SESSION_KEY);
    if (!token) return null;
    
    if (BASE_URL) {
      const response = await fetch(`${BASE_URL}/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return null;
      return await response.json();
    } else {
      const usersStr = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];
      const nik = token.replace('mock-jwt-token-for-', '');
      const user = users.find(u => u.nik === nik);
      return user || null;
    }
  },

  // Complaints
  getComplaints: async (): Promise<Complaint[]> => {
    if (BASE_URL) {
      const token = await AsyncStorage.getItem(SESSION_KEY);
      const response = await fetch(`${BASE_URL}/complaints`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Gagal mengambil data laporan.');
      return await response.json();
    } else {
      await new Promise(r => setTimeout(r, 500));
      const complaintsStr = await AsyncStorage.getItem(COMPLAINTS_KEY);
      return complaintsStr ? JSON.parse(complaintsStr) : [];
    }
  },

  createComplaint: async (complaintData: Partial<Complaint>): Promise<Complaint> => {
    if (BASE_URL) {
      const token = await AsyncStorage.getItem(SESSION_KEY);
      
      const formData = new FormData();
      formData.append('title', complaintData.title || '');
      formData.append('description', complaintData.description || '');
      formData.append('category', complaintData.category || '');
      formData.append('severity', complaintData.severity || '');
      formData.append('location', complaintData.location || '');
      formData.append('reporter', complaintData.reporter || '');
      
      if (complaintData.image) {
        const uri = complaintData.image;
        if (uri.startsWith('data:image')) {
          const uriParts = uri.split(',');
          const mimeType = uriParts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
          const fileExtension = mimeType.split('/')[1] || 'jpeg';
          
          formData.append('image', {
            uri: uri,
            name: `upload.${fileExtension}`,
            type: mimeType,
          } as any);
        } else {
          const uriParts = uri.split('.');
          const fileType = uriParts[uriParts.length - 1];
          formData.append('image', {
            uri: uri,
            name: `upload.${fileType}`,
            type: `image/${fileType}`,
          } as any);
        }
      }

      const response = await fetch(`${BASE_URL}/complaints`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!response.ok) throw new Error('Gagal mengirim pengaduan.');
      return await response.json();
    } else {
      await new Promise(r => setTimeout(r, 1000));
      const complaintsStr = await AsyncStorage.getItem(COMPLAINTS_KEY);
      const complaints: Complaint[] = complaintsStr ? JSON.parse(complaintsStr) : [];

      const newId = `LAP-00${complaints.length + 1}`;
      const today = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      const formattedDate = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

      const newComplaint: Complaint = {
        id: newId,
        title: complaintData.title || '',
        description: complaintData.description || '',
        category: complaintData.category || '',
        severity: complaintData.severity || '',
        location: complaintData.location || 'Jl. Sudirman No.45, Jakarta Selatan',
        latitude: complaintData.latitude || -6.2183,
        longitude: complaintData.longitude || 106.8021,
        status: 'Diterima',
        date: formattedDate,
        reporter: complaintData.reporter || 'Budi Santoso',
        image: complaintData.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6skW-PuMu_YYFBh-RU9h64CYex847d6RP71t6W0gfJhC4sInlRWLodEGR6mmTyYbHrgZknmUOS6F1mzA96iVwghYA0ZeUwGfBDI2VWOv-Om5sSJNXMzZ5dDQs7IpxQWDk2ofYQmCzkexnDOz6CnV9jokvrI8pJA6vQbTN7M3mEJwp3gx7z84lBSaIlRlsaen34yIYwFZbX_-rIZTilXSAjfewedhgkTgCnMj2jCG3xiUGadWI2H6Sjnl9GvJwITHKWQEguszxG40',
        comments: [
          { id: 'c1', author: 'Sistem', content: 'Laporan sukses dikirim dan terdaftar di database.', date: `${formattedDate}, 12:00` }
        ],
        timeline: [
          { title: 'Laporan diterima', description: 'Laporan sukses diverifikasi oleh sistem', date: `${formattedDate}, 12:00`, done: true },
          { title: 'Sedang diproses', description: 'Menunggu penugasan tim teknis', date: '--', done: false },
          { title: 'Perbaikan selesai', description: 'Estimasi perbaikan selesai', date: '--', done: false }
        ]
      };

      complaints.unshift(newComplaint);
      await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
      return newComplaint;
    }
  },

  // Comments
  addComment: async (complaintId: string, content: string, authorName: string): Promise<Comment> => {
    if (BASE_URL) {
      const token = await AsyncStorage.getItem(SESSION_KEY);
      const response = await fetch(`${BASE_URL}/complaints/${complaintId}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, author: authorName })
      });
      if (!response.ok) throw new Error('Gagal mengirim komentar.');
      return await response.json();
    } else {
      await new Promise(r => setTimeout(r, 300));
      const complaintsStr = await AsyncStorage.getItem(COMPLAINTS_KEY);
      const complaints: Complaint[] = complaintsStr ? JSON.parse(complaintsStr) : [];

      const complaintIndex = complaints.findIndex(c => c.id === complaintId);
      if (complaintIndex === -1) throw new Error('Aduan tidak ditemukan.');

      const today = new Date();
      const formattedDate = `${today.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'][today.getMonth()]} ${today.getFullYear()}, ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

      const newComment: Comment = {
        id: `com-${Date.now()}`,
        author: authorName,
        content: content,
        date: formattedDate
      };

      complaints[complaintIndex].comments.push(newComment);
      await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
      return newComment;
    }
  },

  deleteComplaint: async (id: string): Promise<void> => {
    if (BASE_URL) {
      const token = await AsyncStorage.getItem(SESSION_KEY);
      const response = await fetch(`${BASE_URL}/complaints/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Gagal menghapus laporan.');
    } else {
      await new Promise(r => setTimeout(r, 500));
      const complaintsStr = await AsyncStorage.getItem(COMPLAINTS_KEY);
      const complaints: Complaint[] = complaintsStr ? JSON.parse(complaintsStr) : [];
      const filtered = complaints.filter(c => c.id !== id);
      await AsyncStorage.setItem(COMPLAINTS_KEY, JSON.stringify(filtered));
    }
  }
};

export default api;
