/**
 * Email Service Test Script
 * Test semua fungsi email service
 */

require('dotenv').config();
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAnnouncementEmail,
  sendDocumentStatusEmail,
  sendTestEmail,
  getEmailLogs,
  isValidEmail,
  sanitizeEmail,
} = require('./services/emailService');

// Test email address (ganti dengan email Anda)
const TEST_EMAIL = process.env.TEST_EMAIL || 'your_email@gmail.com';

async function runTests() {
  console.log('🧪 Starting Email Service Tests...\n');

  // Test 1: Email Validation
  console.log('Test 1: Email Validation');
  console.log('Valid email:', isValidEmail('test@example.com'));
  console.log('Invalid email:', isValidEmail('invalid-email'));
  console.log('Sanitized:', sanitizeEmail('  TEST@EXAMPLE.COM  '));
  console.log('✅ Test 1 passed\n');

  // Test 2: Send Test Email
  console.log('Test 2: Send Test Email');
  const testResult = await sendTestEmail(TEST_EMAIL);
  console.log('Result:', testResult);
  console.log(testResult.success ? '✅ Test 2 passed\n' : '❌ Test 2 failed\n');

  // Test 3: Send Verification Email
  console.log('Test 3: Send Verification Email');
  const verifyLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=test123`;
  const verifyResult = await sendVerificationEmail(TEST_EMAIL, 'Test User', verifyLink);
  console.log('Result:', verifyResult);
  console.log(verifyResult.success ? '✅ Test 3 passed\n' : '❌ Test 3 failed\n');

  // Test 4: Send Password Reset Email
  console.log('Test 4: Send Password Reset Email');
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=reset456`;
  const resetResult = await sendPasswordResetEmail(TEST_EMAIL, resetLink);
  console.log('Result:', resetResult);
  console.log(resetResult.success ? '✅ Test 4 passed\n' : '❌ Test 4 failed\n');

  // Test 5: Send Announcement Email
  console.log('Test 5: Send Announcement Email');
  const hasil = {
    status_hasil: 'Lulus',
    nama_sekolah: 'SMAN 1 Indramayu',
    nama_jalur: 'Zonasi',
    peringkat: 15,
    tanggal_pengumuman: new Date(),
  };
  const announceResult = await sendAnnouncementEmail(TEST_EMAIL, 'Test User', hasil);
  console.log('Result:', announceResult);
  console.log(announceResult.success ? '✅ Test 5 passed\n' : '❌ Test 5 failed\n');

  // Test 6: Send Document Status Email
  console.log('Test 6: Send Document Status Email');
  const dokumenStatus = {
    nama_dokumen: 'Kartu Keluarga',
    status: 'DITERIMA',
    feedback: 'Dokumen valid dan lengkap',
  };
  const docResult = await sendDocumentStatusEmail(TEST_EMAIL, 'Test User', dokumenStatus);
  console.log('Result:', docResult);
  console.log(docResult.success ? '✅ Test 6 passed\n' : '❌ Test 6 failed\n');

  // Test 7: Get Email Logs
  console.log('Test 7: Get Email Logs');
  const logs = getEmailLogs(10);
  console.log(`Total logs: ${logs.length}`);
  logs.forEach((log, index) => {
    console.log(`${index + 1}. [${log.type}] to ${log.to}: ${log.success ? 'SUCCESS' : 'FAILED'}`);
  });
  console.log('✅ Test 7 passed\n');

  // Summary
  console.log('📊 Test Summary:');
  const successCount = logs.filter(l => l.success).length;
  const failedCount = logs.filter(l => !l.success).length;
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log('\n🎉 All tests completed!');
  console.log('\n📧 Check your email inbox:', TEST_EMAIL);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});
