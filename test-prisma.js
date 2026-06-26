const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
console.log('PrismaClient created');
p.user.count()
  .then(n => {
    console.log('User count:', n);
    return p.$disconnect();
  })
  .then(() => console.log('OK'))
  .catch(e => {
    console.error('ERROR:', e.message);
    console.error('CODE:', e.code || 'N/A');
    process.exit(1);
  });
