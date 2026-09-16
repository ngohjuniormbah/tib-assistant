'use server';

export type User = {
  name: string;
  email: string;
  emailHashed: string;
  recordId: string | undefined;
} | null;

export async function initPocketbase() {
  return null as any;
}

export async function isAuthenticated() {
  return true;
}

export async function getUserData(): Promise<User> {
  return {
    name: 'Researcher',
    email: 'researcher@example.org',
    emailHashed: 'd41d8cd98f00b204e9800998ecf8427e',
    recordId: 'demo-user-id',
  };
}

export async function signOut(redirectUrl: string) {
  return { url: redirectUrl };
}
