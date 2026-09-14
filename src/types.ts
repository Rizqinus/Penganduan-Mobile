export interface User {
  name: string;
  nik: string;
  email: string;
  phone: string;
  password?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

export interface TimelineStep {
  title: string;
  description: string;
  date: string;
  done: boolean;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  location: string;
  latitude: number;
  longitude: number;
  status: string;
  date: string;
  reporter: string;
  image: string;
  comments: Comment[];
  timeline: TimelineStep[];
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (emailOrNik: string, password: string) => Promise<User>;
  register: (userData: User) => Promise<User>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}
