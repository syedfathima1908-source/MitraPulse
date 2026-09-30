import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import type { AttendanceCorrectionRequest } from '../types/request';
import { SEED_REQUESTS } from '../utils/seedData';
import { getAttendanceRecordsForDate, updateAttendanceDay, getAttendanceDay } from './attendanceService';

const REQUESTS_COLLECTION = 'attendanceCorrectionRequests';
const LOCAL_REQUESTS_KEY = 'mitrapulse_requests_cache';

const getInitialRequests = (): AttendanceCorrectionRequest[] => {
  const cached = localStorage.getItem(LOCAL_REQUESTS_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch {}
  }
  return SEED_REQUESTS;
};

let localRequestsState: AttendanceCorrectionRequest[] = getInitialRequests();

const saveLocalRequests = (requests: AttendanceCorrectionRequest[]) => {
  localRequestsState = requests;
  localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(requests));
};

export const createCorrectionRequest = async (data: {
  studentUid: string;
  studentName: string;
  rollNumber: string;
  teamId: any;
  attendanceDate: string;
  reason: string;
}): Promise<AttendanceCorrectionRequest> => {
  // Rule check: 1. Fetch attendance record for the date
  const records = await getAttendanceRecordsForDate(data.attendanceDate);
  const targetRecord = records.find((r) => r.memberUid === data.studentUid);

  if (!targetRecord) {
    throw new Error(`No attendance record found for date ${data.attendanceDate}.`);
  }

  // Rule check: 2. Current status must be absent
  if (targetRecord.status !== 'absent') {
    throw new Error('Correction request can only be submitted for Absent records.');
  }

  // Rule check: 3. Check duplicate active (pending) request for same student & date
  const allRequests = localRequestsState;
  const duplicate = allRequests.find(
    (r) =>
      r.studentUid === data.studentUid &&
      r.attendanceDate === data.attendanceDate &&
      r.status === 'pending'
  );

  if (duplicate) {
    throw new Error(`A pending request for date ${data.attendanceDate} already exists.`);
  }

  const newId = `req-${Date.now()}`;
  const now = new Date().toISOString();

  const newRequest: AttendanceCorrectionRequest = {
    id: newId,
    studentUid: data.studentUid,
    studentName: data.studentName,
    rollNumber: data.rollNumber,
    teamId: data.teamId,
    attendanceDate: data.attendanceDate,
    currentStatus: 'absent',
    reason: data.reason,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, REQUESTS_COLLECTION, newId), newRequest);
  } catch {}

  const updated = [newRequest, ...localRequestsState];
  saveLocalRequests(updated);

  return newRequest;
};

export const getRequestsForStudent = async (
  studentUid: string
): Promise<AttendanceCorrectionRequest[]> => {
  try {
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where('studentUid', '==', studentUid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const requests = snapshot.docs.map((d) => d.data() as AttendanceCorrectionRequest);
      return requests;
    }
  } catch {}
  return localRequestsState.filter((r) => r.studentUid === studentUid);
};

export const getAllRequests = async (): Promise<AttendanceCorrectionRequest[]> => {
  try {
    const q = query(collection(db, REQUESTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const requests = snapshot.docs.map((d) => d.data() as AttendanceCorrectionRequest);
      saveLocalRequests(requests);
      return requests;
    }
  } catch {}
  return localRequestsState;
};

export const approveCorrectionRequest = async (
  requestId: string,
  facultyUid: string
): Promise<void> => {
  const request = localRequestsState.find((r) => r.id === requestId);
  if (!request) {
    throw new Error('Request not found.');
  }

  if (request.status !== 'pending') {
    throw new Error('This request has already been finalized and cannot be processed again.');
  }

  const now = new Date().toISOString();

  // 1. Load attendance records for date
  const records = await getAttendanceRecordsForDate(request.attendanceDate);
  const updatedRecords = records.map((rec) =>
    rec.memberUid === request.studentUid
      ? { ...rec, status: 'present' as const, updatedAt: now }
      : rec
  );

  // 2. Update attendance day in Firestore & local storage
  await updateAttendanceDay(request.attendanceDate, updatedRecords);

  // 3. Update request status to approved
  const requestPayload = {
    status: 'approved' as const,
    reviewedBy: facultyUid,
    reviewedAt: now,
    updatedAt: now,
  };

  try {
    await updateDoc(doc(db, REQUESTS_COLLECTION, requestId), requestPayload);
  } catch {}

  const updatedRequests = localRequestsState.map((r) =>
    r.id === requestId ? { ...r, ...requestPayload } : r
  );
  saveLocalRequests(updatedRequests);
};

export const rejectCorrectionRequest = async (
  requestId: string,
  facultyUid: string
): Promise<void> => {
  const request = localRequestsState.find((r) => r.id === requestId);
  if (!request) {
    throw new Error('Request not found.');
  }

  if (request.status !== 'pending') {
    throw new Error('This request has already been finalized and cannot be processed again.');
  }

  const now = new Date().toISOString();
  const requestPayload = {
    status: 'rejected' as const,
    reviewedBy: facultyUid,
    reviewedAt: now,
    updatedAt: now,
  };

  try {
    await updateDoc(doc(db, REQUESTS_COLLECTION, requestId), requestPayload);
  } catch {}

  const updatedRequests = localRequestsState.map((r) =>
    r.id === requestId ? { ...r, ...requestPayload } : r
  );
  saveLocalRequests(updatedRequests);
};

export const subscribeToStudentRequests = (
  studentUid: string,
  callback: (requests: AttendanceCorrectionRequest[]) => void
): (() => void) => {
  try {
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where('studentUid', '==', studentUid),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const reqs = snapshot.docs.map((d) => d.data() as AttendanceCorrectionRequest);
          callback(reqs);
        } else {
          callback(localRequestsState.filter((r) => r.studentUid === studentUid));
        }
      },
      () => callback(localRequestsState.filter((r) => r.studentUid === studentUid))
    );
  } catch {
    callback(localRequestsState.filter((r) => r.studentUid === studentUid));
    return () => {};
  }
};

export const subscribeToAllRequests = (
  callback: (requests: AttendanceCorrectionRequest[]) => void
): (() => void) => {
  try {
    const q = query(collection(db, REQUESTS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const reqs = snapshot.docs.map((d) => d.data() as AttendanceCorrectionRequest);
          saveLocalRequests(reqs);
          callback(reqs);
        } else {
          callback(localRequestsState);
        }
      },
      () => callback(localRequestsState)
    );
  } catch {
    callback(localRequestsState);
    return () => {};
  }
};
