import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';

const BASE_URL = 'http://localhost:5000/api';

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

describe('Centralized Student Portfolio Platform & Staff Verification Test Suite', () => {
  let adminToken = '';
  let studentToken = '';
  let staffToken = '';
  let studentId = '';
  let studentSlug = '';
  let testProjectId = '';
  let testDocId = '';
  let newStaffId = '';

  before(async () => {
    const running = await isPortOpen(5000);
    if (!running) {
      await import('../server.js');
      // Wait for express to be ready
      for (let i = 0; i < 20; i++) {
        if (await isPortOpen(5000)) break;
        await new Promise(r => setTimeout(r, 200));
      }
    }
  });

  test('1. Health Check Endpoint', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.status, 'ok');
  });

  test('2. Admin Login with Role Verification', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college.edu',
        password: 'AdminPassword@123'
      })
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.user.role, 'ADMIN');
    assert.ok(data.token);
    adminToken = data.token;
  });

  test('3. Student Login and Session Retrieval', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'keerthana.ar@college.edu',
        password: 'Student@123'
      })
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.user.role, 'STUDENT');
    assert.equal(data.user.studentProfile.slug, 'keerthana-ar');
    studentToken = data.token;
    studentSlug = data.user.studentProfile.slug;
    studentId = data.user.studentProfile.id;
  });

  test('4. Staff Login and Dashboard Authorization', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'staff.mca@college.edu',
        password: 'StaffPassword@123'
      })
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.user.role, 'STAFF');
    assert.ok(data.user.staffProfile);
    assert.equal(data.user.staffProfile.fullName, 'Prof. Rajesh Kumar');
    staffToken = data.token;
  });

  test('5. RBAC & Security Restrictions: Mutual Role Isolation', async () => {
    // 5a: Student cannot access Admin endpoints
    const res1 = await fetch(`${BASE_URL}/admin/students`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.equal(res1.status, 403);

    // 5b: Student cannot access Staff verification endpoints
    const res2 = await fetch(`${BASE_URL}/staff/overview`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.equal(res2.status, 403);

    // 5c: Staff cannot access Admin endpoints
    const res3 = await fetch(`${BASE_URL}/admin/students`, {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert.equal(res3.status, 403);
  });

  test('6. Security & Privacy: Public Portfolio NEVER exposes dateOfBirth', async () => {
    const res = await fetch(`${BASE_URL}/public/students/keerthana-ar`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.student.fullName, 'Keerthana A R');
    assert.equal(data.student.dateOfBirth, undefined);
  });

  test('7. Admin creates or authorizes a new Staff account', async () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const res = await fetch(`${BASE_URL}/admin/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        fullName: `Dr. Ramesh Test ${randomSuffix}`,
        email: `ramesh.${randomSuffix}@college.edu`,
        staffId: `STF-TEST-${randomSuffix}`,
        designation: 'Class In-charge / Tutor',
        initialPassword: 'StaffPassword@123'
      })
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.ok(data.staff.id);
    newStaffId = data.staff.id;
  });

  test('8. Admin Account & Credential Management: Reset password securely', async () => {
    const listRes = await fetch(`${BASE_URL}/admin/credentials?role=STUDENT&q=keerthana`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const listData = await listRes.json();
    assert.equal(listRes.status, 200);
    assert.ok(listData.users.length >= 1);
    const targetUserId = listData.users[0].id;

    // Reset credential
    const resetRes = await fetch(`${BASE_URL}/admin/credentials/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        userId: targetUserId,
        newPassword: 'Student@123'
      })
    });
    const resetData = await resetRes.json();
    assert.equal(resetRes.status, 200);
    assert.equal(resetData.success, true);
    assert.ok(resetData.tempPassword);
  });

  test('9. Student Document Submission & Initial Pending Status', async () => {
    const res = await fetch(`${BASE_URL}/students/me/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Kubernetes Certified Administrator (CKA) Certificate',
        category: 'CERTIFICATE',
        fileUrl: '/uploads/documents/sample-cka-certificate.pdf',
        fileName: 'sample-cka-certificate.pdf',
        fileSize: 1048576,
        description: 'Certified Kubernetes Administrator certification proof.',
        credentialUrl: 'https://cncf.io/verify/CKA-2025-9988'
      })
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.document.status, 'PENDING');
    testDocId = data.document.id;
    assert.ok(testDocId);
  });

  test('10. Staff Verification: Request Correction / Resubmission', async () => {
    // 10a: Staff retrieves verification item
    const getRes = await fetch(`${BASE_URL}/staff/verifications/${testDocId}`, {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    const getData = await getRes.json();
    assert.equal(getRes.status, 200);
    assert.equal(getData.submission.title, 'Kubernetes Certified Administrator (CKA) Certificate');

    // 10b: Staff requests correction with mandatory reason
    const decRes = await fetch(`${BASE_URL}/staff/verifications/${testDocId}/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        decision: 'RESUBMISSION_REQUIRED',
        comments: 'The uploaded PDF is missing the signature block and validation QR code. Please re-upload full official PDF.'
      })
    });
    const decData = await decRes.json();
    assert.equal(decRes.status, 200);
    assert.equal(decData.success, true);
    assert.equal(decData.submission.status, 'RESUBMISSION_REQUIRED');
  });

  test('11. Student Resubmission: Retains history and resets status to Pending', async () => {
    const resubmitRes = await fetch(`${BASE_URL}/students/me/documents/${testDocId}/resubmit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Kubernetes Certified Administrator (CKA) Certificate (Updated Scan)',
        fileUrl: '/uploads/documents/sample-cka-certificate-verified.pdf',
        fileName: 'sample-cka-certificate-verified.pdf',
        description: 'Re-uploaded full high-resolution PDF including validation QR code and signature block.'
      })
    });
    const resubmitData = await resubmitRes.json();
    assert.equal(resubmitRes.status, 200);
    assert.equal(resubmitData.success, true);
    assert.equal(resubmitData.document.status, 'PENDING');
    assert.equal(resubmitData.document.version, 2);
    // Verify previous verification history is preserved
    assert.ok(resubmitData.document.verificationRecords.length >= 1);
    assert.equal(resubmitData.document.verificationRecords[0].decision, 'RESUBMISSION_REQUIRED');
  });

  test('12. Staff Verification: Final Approval & Permanent Verification Record', async () => {
    const approveRes = await fetch(`${BASE_URL}/staff/verifications/${testDocId}/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        decision: 'VERIFIED',
        comments: 'Validated against CNCF verification portal. QR code confirmed authentic.'
      })
    });
    const approveData = await approveRes.json();
    assert.equal(approveRes.status, 200);
    assert.equal(approveData.success, true);
    assert.equal(approveData.submission.status, 'VERIFIED');
    assert.equal(approveData.record.reviewerName, 'Prof. Rajesh Kumar');
    assert.equal(approveData.record.decision, 'VERIFIED');
  });

  test('13. Centralized Verification Logs Monitored by Admin', async () => {
    const res = await fetch(`${BASE_URL}/admin/verification-logs?decision=VERIFIED`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.records.length >= 1);

    // Verify audit record contains reviewer, action, affected student, timestamp, and comments
    const logItem = data.records.find(r => r.documentSubmissionId === testDocId);
    assert.ok(logItem);
    assert.equal(logItem.reviewerName, 'Prof. Rajesh Kumar');
    assert.equal(logItem.decision, 'VERIFIED');
    assert.ok(logItem.createdAt);
    assert.ok(logItem.comments.includes('CNCF'));
  });

  test('14. Student CRUD: Projects roundtrip persistence', async () => {
    const createRes = await fetch(`${BASE_URL}/students/me/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Cloud Document Verification Engine',
        summary: 'Automated verification test runner.',
        description: 'Ensures database persistence across staff and admin operations.',
        technologies: ['Node.js', 'PostgreSQL', 'Prisma'],
        progressStatus: 'COMPLETED'
      })
    });
    const createData = await createRes.json();
    assert.equal(createRes.status, 201);
    testProjectId = createData.project.id;

    const delRes = await fetch(`${BASE_URL}/students/me/projects/${testProjectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.equal(delRes.status, 200);
  });

  test('15. Security & Verification Protection: Verified documents cannot be deleted by student', async () => {
    const delRes = await fetch(`${BASE_URL}/students/me/documents/${testDocId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    // Should be prevented since it is already verified
    assert.equal(delRes.status, 400);
  });

  after(() => {
    setTimeout(() => {
      process.exit(0);
    }, 200);
  });
});
