console.log('Raw .env variables:');
console.log(process.env);
// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load .env file explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Read env variables
const PORT = process.env.PORT || 8010;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

console.log('PORT:', PORT);
console.log('MONGO_URI:', MONGO_URI);

// Check if MONGO_URI exists
if (!MONGO_URI) {
  console.error("MongoDB URI not found. Make sure .env file exists and has MONGO_URI");
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// ===== User Schema =====
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  membership: { type: String, default: 'Basic' },
  purchasedItems: { type: Array, default: [] }
});

const User = mongoose.model('User', userSchema);

// ===== REGISTER =====
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== LOGIN =====
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'All fields required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      name: user.name,
      email: user.email,
      membership: user.membership,
      purchasedItems: user.purchasedItems,
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== PROTECTED ROUTE =====
app.get('/api/profile', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err.message });
  }
});

// ===== TEST ROUTE =====
app.get('/', (req, res) => res.send('Plant-Disease-App Backend is running!'));

// ===== START SERVER =====
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));