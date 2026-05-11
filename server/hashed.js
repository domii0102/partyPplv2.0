import bcrypt from 'bcrypt';
const hash = await bcrypt.hash('12345678', 10);
console.log(hash);