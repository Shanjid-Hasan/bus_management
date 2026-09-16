/**
 * Promote an existing registered user to 'admin' or 'manager' so you can
 * demo the role-protected Bus Management page (registration always creates
 * plain 'user' accounts, by design — role escalation isn't self-service).
 *
 * Usage:
 *   node seed/promoteUser.js you@example.com admin
 *   node seed/promoteUser.js you@example.com manager
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');

const [, , email, role] = process.argv;

const run = async () => {
  if (!email || !['admin', 'manager'].includes(role)) {
    console.log('Usage: node seed/promoteUser.js <email> <admin|manager>');
    process.exit(1);
  }

  try {
    await connectDB();

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role },
      { new: true }
    );

    if (!user) {
      console.error(`❌ No user found with email "${email}". Register the account first.`);
      process.exit(1);
    }

    console.log(`✅ ${user.email} is now "${user.role}".`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update user role:', error.message);
    process.exit(1);
  }
};

run();
