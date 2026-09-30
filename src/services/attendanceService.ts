import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';
import { db } from './firebase';
import type { AttendanceDay, AttendanceRecord } from '../types/attendance';
import { SEED_ATTENDANCE_DAYS, SEED_ATTENDANCE_RECORDS } from '../utils/seedData';

const ATTENDANCE_DAYS_COLLECTION = 'attendanceDays';
const LOCAL_DAYS_KEY = 'mitrapulse_attendance_days_cache';
const LOCAL_RECORDS_KEY = 'mitrapulse_attendance_records_cache';

const getInitialDays = (): AttendanceDay[] => {
  const cached = localStorage.getItem(LOCAL_DAYS_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch {}
  }
  return SEED_ATTENDANCE_DAYS;
};

const getInitialRecordsMap = (): Record<string, AttendanceRecord[]> => {
  const cached = localStorage.getItem(LOCAL_RECORDS_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch {}
  }
  return SEED_ATTENDANCE_RECORDS;
};

let localDaysState: AttendanceDay[] = getInitialDays();
let localRecordsMapState: Record<string, AttendanceRecord[]> = getInitialRecordsMap();

const saveLocalDays = (days: AttendanceDay[]) => {
  localDaysState = days;
  localStorage.setItem(LOCAL_DAYS_KEY, JSON.stringify(days));
};

const saveLocalRecordsMap = (map: Record<string, AttendanceRecord[]>) => {
  localRecordsMapState = map;
  localStorage.setItem(LOCAL_RECORDS_KEY, JSON.stringify(map));
};

export const getAllAttendanceDays = async (): Promise<AttendanceDay[]> => {
  try {
    const q = query(collection(db, ATTENDANCE_DAYS_COLLECTION), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const days = snapshot.docs.map((d) => d.data() as AttendanceDay);
      saveLocalDays(days);
      return days;
    }
  } catch {}
  return localDaysState;
};

export const getAttendanceDay = async (date: string): Promise<AttendanceDay | null> => {
  try {
    const docRef = doc(db, ATTENDANCE_DAYS_COLLECTION, date);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AttendanceDay;
    }
  } catch {}
  return localDaysState.find((d) => d.date === date) || null;
};

export const getAttendanceRecordsForDate = async (date: string): Promise<AttendanceRecord[]> => {
  try {
    const recordsRef = collection(db, ATTENDANCE_DAYS_COLLECTION, date, 'records');
    const snapshot = await getDocs(recordsRef);
    if (!snapshot.empty) {
      const records = snapshot.docs.map((d) => d.data() as AttendanceRecord);
      const newMap = { ...localRecordsMapState, [date]: records };
      saveLocalRecordsMap(newMap);
      return records;
    }
  } catch {}
  return localRecordsMapState[date] || [];
};

export const saveAttendanceDay = async (
  date: string,
  markedByUid: string,
  records: AttendanceRecord[]
): Promise<AttendanceDay> => {
  // Check duplicate date document
  const existing = await getAttendanceDay(date);
  if (existing) {
    throw new Error(`Attendance for date ${date} has already been marked. Use Edit Attendance instead.`);
  }

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const totalMembers = records.length;

  // Enforce critical attendance invariant: totalMembers = presentCount + absentCount
  if (totalMembers !== presentCount + absentCount) {
    throw new Error('Attendance count mismatch: total active members must equal present count plus absent count.');
  }

  const now = new Date().toISOString();
  const dayDoc: AttendanceDay = {
    date,
    markedBy: markedByUid,
    totalMembers,
    presentCount,
    absentCount,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const batch = writeBatch(db);
    const dayRef = doc(db, ATTENDANCE_DAYS_COLLECTION, date);
    batch.set(dayRef, dayDoc);

    records.forEach((rec) => {
      const recRef = doc(db, ATTENDANCE_DAYS_COLLECTION, date, 'records', rec.memberUid);
      batch.set(recRef, rec);
    });

    await batch.commit();
  } catch {}

  const updatedDays = [dayDoc, ...localDaysState.filter((d) => d.date !== date)];
  saveLocalDays(updatedDays);

  const updatedRecordsMap = { ...localRecordsMapState, [date]: records };
  saveLocalRecordsMap(updatedRecordsMap);

  return dayDoc;
};

export const updateAttendanceDay = async (
  date: string,
  records: AttendanceRecord[]
): Promise<AttendanceDay> => {
  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const totalMembers = records.length;

  if (totalMembers !== presentCount + absentCount) {
    throw new Error('Attendance count mismatch.');
  }

  const now = new Date().toISOString();
  const existingDay = localDaysState.find((d) => d.date === date);

  const updatedDay: AttendanceDay = {
    date,
    markedBy: existingDay?.markedBy || 'faculty',
    totalMembers,
    presentCount,
    absentCount,
    createdAt: existingDay?.createdAt || now,
    updatedAt: now,
  };

  try {
    const batch = writeBatch(db);
    const dayRef = doc(db, ATTENDANCE_DAYS_COLLECTION, date);
    batch.set(dayRef, updatedDay, { merge: true });

    records.forEach((rec) => {
      const recRef = doc(db, ATTENDANCE_DAYS_COLLECTION, date, 'records', rec.memberUid);
      batch.set(recRef, { ...rec, updatedAt: now }, { merge: true });
    });

    await batch.commit();
  } catch {}

  const updatedDays = localDaysState.map((d) => (d.date === date ? updatedDay : d));
  if (!updatedDays.some((d) => d.date === date)) {
    updatedDays.unshift(updatedDay);
  }
  saveLocalDays(updatedDays);

  const updatedRecordsMap = { ...localRecordsMapState, [date]: records };
  saveLocalRecordsMap(updatedRecordsMap);

  return updatedDay;
};

export const getAttendanceRecordsForMemberMap = async (
  memberUid: string
): Promise<Record<string, AttendanceRecord>> => {
  const result: Record<string, AttendanceRecord> = {};
  const days = await getAllAttendanceDays();

  for (const day of days) {
    const records = await getAttendanceRecordsForDate(day.date);
    const found = records.find((r) => r.memberUid === memberUid);
    if (found) {
      result[day.date] = found;
    }
  }

  return result;
};

export const subscribeToAttendanceDays = (
  callback: (days: AttendanceDay[]) => void
): (() => void) => {
  try {
    const q = query(collection(db, ATTENDANCE_DAYS_COLLECTION), orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const days = snapshot.docs.map((d) => d.data() as AttendanceDay);
          saveLocalDays(days);
          callback(days);
        } else {
          callback(localDaysState);
        }
      },
      () => callback(localDaysState)
    );
  } catch {
    callback(localDaysState);
    return () => {};
  }
};
