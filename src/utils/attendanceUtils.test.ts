import { calculateAttendancePercentage, formatAttendancePercentage, isDateApplicableForMember } from './attendanceUtils';

// Verification test suite for business calculation invariants
const runVerificationTests = () => {
  console.log('Running Attendance Utils Verification Tests...');

  // Test 1: Standard percentage calculation
  const test1 = calculateAttendancePercentage(29, 32);
  if (Math.abs(test1 - 90.625) > 0.001) {
    throw new Error(`Test 1 failed: expected 90.625, got ${test1}`);
  }

  // Test 2: 0 applicable days edge case
  const test2 = calculateAttendancePercentage(0, 0);
  if (test2 !== 0) {
    throw new Error(`Test 2 failed: expected 0, got ${test2}`);
  }

  // Test 3: Formatting NaN / Infinity safety
  const fmt1 = formatAttendancePercentage(NaN);
  if (fmt1 !== '0%') {
    throw new Error(`Test 3 failed: expected "0%", got ${fmt1}`);
  }

  const fmt2 = formatAttendancePercentage(90.625);
  if (fmt2 !== '90.6%') {
    throw new Error(`Test 4 failed: expected "90.6%", got ${fmt2}`);
  }

  // Test 4: Member joined date filter check
  const isBefore = isDateApplicableForMember('2026-01-10', '2026-01-15');
  if (isBefore !== false) {
    throw new Error('Test 5 failed: date before joinedAt must return false');
  }

  const isAfter = isDateApplicableForMember('2026-01-20', '2026-01-15');
  if (isAfter !== true) {
    throw new Error('Test 6 failed: date after joinedAt must return true');
  }

  console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
};

runVerificationTests();
