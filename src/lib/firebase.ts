/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Mock User type to match Firebase User
export interface User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  tenantId: string | null;
  providerData: any[];
}

class MockAuth {
  private listeners: ((user: User | null) => void)[] = [];
  currentUser: User | null = null;

  constructor() {
    // Check local storage for existing session
    const savedUser = localStorage.getItem('ssa_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.currentUser));
  }

  async signIn(email: string) {
    // In SSA Portal, we allow any teacher email for demo purposes
    this.currentUser = {
      uid: 'ssa-teacher-' + Math.random().toString(36).substr(2, 9),
      email: email,
      emailVerified: true,
      isAnonymous: false,
      tenantId: null,
      providerData: []
    };
    localStorage.setItem('ssa_user', JSON.stringify(this.currentUser));
    this.notify();
    return { user: this.currentUser };
  }

  async signOut() {
    this.currentUser = null;
    localStorage.removeItem('ssa_user');
    this.notify();
  }
}

class MockDB {
  async add(collectionName: string, data: any) {
    const results = this.getAll(collectionName);
    const newDoc = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString()
    };
    results.push(newDoc);
    localStorage.setItem(`ssa_${collectionName}`, JSON.stringify(results));
    return newDoc;
  }

  getAll(collectionName: string) {
    const data = localStorage.getItem(`ssa_${collectionName}`);
    return data ? JSON.parse(data) : [];
  }

  subscribe(collectionName: string, callback: (data: any[]) => void) {
    // Simple polling or event-based simulation
    const interval = setInterval(() => {
      callback(this.getAll(collectionName).sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }, 1000);
    
    callback(this.getAll(collectionName).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));

    return () => clearInterval(interval);
  }
}

export const auth = new MockAuth();
export const db = new MockDB();
