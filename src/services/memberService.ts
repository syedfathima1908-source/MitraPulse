import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Member } from '../types/member';
import { SEED_MEMBERS } from '../utils/seedData';
import type { TeamId } from '../types/team';

const MEMBERS_COLLECTION = 'members';
const USERS_COLLECTION = 'users';

// Local storage cache for offline/demo mode
const LOCAL_MEMBERS_KEY = 'mitrapulse_members_cache';

const getInitialMembers = (): Member[] => {
  const cached = localStorage.getItem(LOCAL_MEMBERS_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }
  return SEED_MEMBERS;
};

let localMembersState: Member[] = getInitialMembers();

const saveLocalMembers = (members: Member[]) => {
  localMembersState = members;
  localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(members));
};

export const getMembers = async (): Promise<Member[]> => {
  try {
    const q = query(collection(db, MEMBERS_COLLECTION), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const members = snapshot.docs.map((doc) => doc.data() as Member);
      saveLocalMembers(members);
      return members;
    }
  } catch {
    // Return fallback state if Firestore fails or in demo mode
  }
  return localMembersState;
};

export const addMember = async (data: {
  name: string;
  email: string;
  rollNumber: string;
  teamId: TeamId;
}): Promise<Member> => {
  const newUid = `stu-${Date.now()}`;
  const now = new Date().toISOString();
  const todayDate = now.substring(0, 10);

  const newMember: Member = {
    uid: newUid,
    name: data.name,
    email: data.email,
    rollNumber: data.rollNumber,
    teamId: data.teamId,
    isActive: true,
    joinedAt: todayDate,
    createdAt: now,
    updatedAt: now,
  };

  try {
    // Write to Firestore members collection
    await setDoc(doc(db, MEMBERS_COLLECTION, newUid), newMember);
    // Write user profile document for auth reference
    await setDoc(doc(db, USERS_COLLECTION, newUid), {
      uid: newUid,
      name: data.name,
      email: data.email,
      role: 'student',
      teamId: data.teamId,
      rollNumber: data.rollNumber,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  } catch {
    // Fallback local memory save
  }

  const updated = [...localMembersState, newMember];
  saveLocalMembers(updated);
  return newMember;
};

export const updateMember = async (
  uid: string,
  data: Partial<Pick<Member, 'name' | 'email' | 'rollNumber' | 'teamId'>>
): Promise<void> => {
  const now = new Date().toISOString();
  const updatePayload = { ...data, updatedAt: now };

  try {
    await updateDoc(doc(db, MEMBERS_COLLECTION, uid), updatePayload);
    await updateDoc(doc(db, USERS_COLLECTION, uid), updatePayload);
  } catch {
    // ignore
  }

  const updated = localMembersState.map((m) =>
    m.uid === uid ? { ...m, ...updatePayload } : m
  );
  saveLocalMembers(updated);
};

export const deactivateMember = async (uid: string): Promise<void> => {
  const now = new Date().toISOString();
  const payload = { isActive: false, updatedAt: now };

  try {
    await updateDoc(doc(db, MEMBERS_COLLECTION, uid), payload);
    await updateDoc(doc(db, USERS_COLLECTION, uid), payload);
  } catch {
    // ignore
  }

  const updated = localMembersState.map((m) =>
    m.uid === uid ? { ...m, ...payload } : m
  );
  saveLocalMembers(updated);
};

export const subscribeToMembers = (callback: (members: Member[]) => void): (() => void) => {
  try {
    const q = query(collection(db, MEMBERS_COLLECTION), orderBy('name', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const members = snapshot.docs.map((d) => d.data() as Member);
          saveLocalMembers(members);
          callback(members);
        } else {
          callback(localMembersState);
        }
      },
      () => callback(localMembersState)
    );
  } catch {
    callback(localMembersState);
    return () => {};
  }
};
