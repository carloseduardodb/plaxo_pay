const bcrypt = require('bcrypt');

const password = process.argv[2];
if (!password) {
  console.log('Usage: node generate-hash.js <password>');
  process.exit(1);
}

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  console.log('Password hash:');
  console.log(hash);
  console.log('\nAdd this to your .env file:');
  console.log(`AUTH_PASSWORD_HASH=${hash}`);
});