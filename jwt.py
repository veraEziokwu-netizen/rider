const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: 123 }, 'your_secret_key', { expiresIn: '1h' });
console.log(token);
