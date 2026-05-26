// ============================================================
// MediCare Hospital — Complete Backend
// Node.js + Express + MongoDB + JWT Auth
// ============================================================

// ─────────────── server.js ───────────────
/*
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// ——— Middleware ———
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// ——— Routes ———
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/doctors',     require('./routes/doctors'));
app.use('/api/patients',    require('./routes/patients'));
app.use('/api/appointments',require('./routes/appointments'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/reviews',     require('./routes/reviews'));
app.use('/api/blogs',       require('./routes/blogs'));
app.use('/api/analytics',   require('./routes/analytics'));

// Error handler
app.use(require('./middleware/errorHandler'));

// ——— DB + Start ———
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error('DB connection error:', err); process.exit(1); });

module.exports = app;
*/


// ============================================================
// MONGODB SCHEMAS (models/)
// ============================================================

// ─────────── models/User.js ───────────
/*
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName:    { type: String, required: true, trim: true },
  lastName:     { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true, minlength: 8 },
  phone:        { type: String },
  dateOfBirth:  { type: Date },
  gender:       { type: String, enum: ['Male','Female','Other'] },
  role:         { type: String, enum: ['patient','doctor','admin'], default: 'patient' },
  avatar:       { type: String },          // Cloudinary URL
  address: {
    street: String, city: String, state: String, zip: String, country: String
  },
  isEmailVerified: { type: Boolean, default: false },
  isActive:        { type: Boolean, default: true },
  lastLogin:       { type: Date },
  resetPasswordToken:   String,
  resetPasswordExpires: Date,
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
*/


// ─────────── models/Doctor.js ───────────
/*
const doctorSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization:{ type: String, required: true },
  department:    { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  qualifications:[{ degree: String, institution: String, year: Number }],
  experience:    { type: Number, required: true },  // years
  bio:           { type: String, maxlength: 1000 },
  languages:     [String],
  consultationFee: { type: Number, required: true },
  availability: [{
    day:       { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
    startTime: String,
    endTime:   String,
    maxSlots:  { type: Number, default: 20 },
  }],
  rating:         { type: Number, default: 0, min: 0, max: 5 },
  totalReviews:   { type: Number, default: 0 },
  totalPatients:  { type: Number, default: 0 },
  avatar:         { type: String },
  isAvailableToday: { type: Boolean, default: true },
  isAcceptingNewPatients: { type: Boolean, default: true },
  licenseNumber:  { type: String, required: true },
  hospital:       { type: String, default: 'MediCare Hospital' },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
*/


// ─────────── models/Appointment.js ───────────
/*
const appointmentSchema = new mongoose.Schema({
  patient:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:     { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  date:       { type: Date, required: true },
  timeSlot:   { type: String, required: true },    // "09:00 AM"
  type:       { type: String, enum: ['in-person','video','phone'], default: 'in-person' },
  status:     { type: String, enum: ['pending','confirmed','completed','cancelled','no-show'], default: 'pending' },
  reason:     { type: String, required: true },
  symptoms:   [String],
  notes:      { type: String },                     // Doctor's notes
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  paymentStatus: { type: String, enum: ['pending','paid','refunded'], default: 'pending' },
  paymentAmount: { type: Number },
  videoRoomId: { type: String },                    // For video consultations
  cancelledBy: { type: String },
  cancelReason:{ type: String },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
*/


// ─────────── models/Prescription.js ───────────
/*
const prescriptionSchema = new mongoose.Schema({
  patient:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:     { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointment:{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  medications: [{
    name:        { type: String, required: true },
    dosage:      String,
    frequency:   String,
    duration:    String,
    instructions:String,
  }],
  diagnosis:   { type: String },
  notes:       { type: String },
  validUntil:  { type: Date },
  pdfUrl:      { type: String },            // Cloudinary PDF URL
  qrCode:      { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
*/


// ─────────── models/Department.js ───────────
/*
const departmentSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  slug:        { type: String, required: true, unique: true },
  description: { type: String },
  icon:        { type: String },
  head:        { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  equipment:   [{ name: String, description: String, count: Number }],
  stats: {
    totalDoctors:   { type: Number, default: 0 },
    totalPatients:  { type: Number, default: 0 },
    successRate:    { type: Number, default: 0 },
  },
  isActive:    { type: Boolean, default: true },
  images:      [String],
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
*/


// ─────────── models/Review.js ───────────
/*
const reviewSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:  { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

reviewSchema.post('save', async function() {
  // Update doctor's average rating
  const Doctor = mongoose.model('Doctor');
  const stats = await this.constructor.aggregate([
    { $match: { doctor: this.doctor } },
    { $group: { _id: '$doctor', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (stats.length) {
    await Doctor.findByIdAndUpdate(this.doctor, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
*/


// ─────────── models/Blog.js ───────────
/*
const blogSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  slug:      { type: String, required: true, unique: true },
  excerpt:   { type: String, required: true, maxlength: 200 },
  content:   { type: String, required: true },
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category:  { type: String, enum: ['Cardiology','Neurology','Orthopedics','Pediatrics','General','Research'] },
  tags:      [String],
  thumbnail: { type: String },
  views:     { type: Number, default: 0 },
  isPublished:{ type: Boolean, default: false },
  publishedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
*/


// ============================================================
// CONTROLLERS (controllers/)
// ============================================================

// ─────────── controllers/authController.js ───────────
/*
const User        = require('../models/User');
const jwt         = require('jsonwebtoken');
const crypto      = require('crypto');
const sendEmail   = require('../utils/sendEmail');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ firstName, lastName, email, password, phone, role: role || 'patient' });

    // Send welcome email
    await sendEmail({
      to: email,
      subject: 'Welcome to MediCare Hospital',
      template: 'welcome',
      data: { name: firstName },
    });

    const token = signToken(user._id);
    res.status(201).json({ success: true, token, data: { user } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account disabled' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.json({ success: true, token, data: { user } });
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken   = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 min
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({ to: user.email, subject: 'Password Reset', template: 'resetPassword', data: { resetURL } });

    res.json({ success: true, message: 'Reset link sent to email' });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Token invalid or expired' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({ success: true, token, data: { user } });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};
*/


// ─────────── controllers/doctorController.js ───────────
/*
const Doctor = require('../models/Doctor');
const User   = require('../models/User');
const cloudinary = require('../config/cloudinary');

exports.getAllDoctors = async (req, res, next) => {
  try {
    const { department, available, search, page = 1, limit = 12, sort = '-rating' } = req.query;

    const query = {};
    if (department)      query.department = department;
    if (available === 'true') query.isAvailableToday = true;

    let dbQuery = Doctor.find(query)
      .populate('user', 'firstName lastName email avatar')
      .populate('department', 'name slug')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    if (search) {
      // Text search via user name
      const users = await User.find({ $text: { $search: search } }).select('_id');
      dbQuery = dbQuery.where('user').in(users.map(u => u._id));
    }

    const [doctors, total] = await Promise.all([dbQuery, Doctor.countDocuments(query)]);

    res.json({ success: true, count: doctors.length, total, pages: Math.ceil(total / limit), data: { doctors } });
  } catch (err) { next(err); }
};

exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'firstName lastName email avatar phone')
      .populate('department', 'name slug icon');

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: { doctor } });
  } catch (err) { next(err); }
};

exports.createDoctor = async (req, res, next) => {
  try {
    // Upload avatar if provided
    let avatarUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'medicare/doctors' });
      avatarUrl = result.secure_url;
    }

    const doctor = await Doctor.create({ ...req.body, avatar: avatarUrl });
    res.status(201).json({ success: true, data: { doctor } });
  } catch (err) { next(err); }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: { doctor } });
  } catch (err) { next(err); }
};

exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (err) { next(err); }
};

exports.getDoctorAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    const doctor = await Doctor.findById(req.params.id).select('availability');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    const daySchedule = doctor.availability.find(a => a.day === dayName);

    // Get booked slots for that date
    const Appointment = require('../models/Appointment');
    const booked = await Appointment.find({
      doctor: req.params.id,
      date: { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) },
      status: { $in: ['pending','confirmed'] },
    }).select('timeSlot');

    const bookedSlots = booked.map(a => a.timeSlot);

    res.json({ success: true, data: { schedule: daySchedule, bookedSlots } });
  } catch (err) { next(err); }
};
*/


// ─────────── controllers/appointmentController.js ───────────
/*
const Appointment = require('../models/Appointment');
const Doctor      = require('../models/Doctor');
const sendEmail   = require('../utils/sendEmail');

exports.createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, timeSlot, type, reason, symptoms } = req.body;

    // Check slot availability
    const conflict = await Appointment.findOne({
      doctor: doctorId, date: new Date(date), timeSlot,
      status: { $in: ['pending','confirmed'] },
    });
    if (conflict) return res.status(409).json({ success: false, message: 'That slot is already booked' });

    const appointment = await Appointment.create({
      patient: req.user._id, doctor: doctorId, date, timeSlot, type, reason, symptoms,
    });

    await appointment.populate([
      { path: 'patient', select: 'firstName lastName email' },
      { path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } },
    ]);

    // Email notifications
    await sendEmail({
      to: appointment.patient.email,
      subject: 'Appointment Confirmation — MediCare',
      template: 'appointmentConfirm',
      data: { appointment },
    });

    res.status(201).json({ success: true, data: { appointment } });
  } catch (err) { next(err); }
};

exports.getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } })
      .populate('department', 'name')
      .sort('-date');
    res.json({ success: true, count: appointments.length, data: { appointments } });
  } catch (err) { next(err); }
};

exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    ).populate('patient doctor');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (req.body.status === 'confirmed') {
      await sendEmail({
        to: appointment.patient.email,
        subject: 'Appointment Confirmed — MediCare',
        template: 'appointmentApproved',
        data: { appointment },
      });
    }

    res.json({ success: true, data: { appointment } });
  } catch (err) { next(err); }
};
*/


// ============================================================
// ROUTES (routes/)
// ============================================================

// ─────────── routes/auth.js ───────────
/*
const router = require('express').Router();
const auth   = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate     = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../utils/validators');

router.post('/register', validate(registerSchema), auth.register);
router.post('/login',    validate(loginSchema),    auth.login);
router.post('/forgot-password',        auth.forgotPassword);
router.patch('/reset-password/:token', auth.resetPassword);
router.get('/me', protect, auth.getMe);

module.exports = router;
*/


// ─────────── routes/doctors.js ───────────
/*
const router  = require('express').Router();
const doctors = require('../controllers/doctorController');
const { protect, restrictTo } = require('../middleware/auth');
const upload  = require('../middleware/upload');

router.get('/',                       doctors.getAllDoctors);
router.get('/:id',                    doctors.getDoctorById);
router.get('/:id/availability',       doctors.getDoctorAvailability);
router.post('/',   protect, restrictTo('admin'), upload.single('avatar'), doctors.createDoctor);
router.put('/:id', protect, restrictTo('admin','doctor'), doctors.updateDoctor);
router.delete('/:id', protect, restrictTo('admin'), doctors.deleteDoctor);

module.exports = router;
*/


// ─────────── routes/appointments.js ───────────
/*
const router       = require('express').Router();
const appointments = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/',      protect, appointments.createAppointment);
router.get('/my',     protect, appointments.getMyAppointments);
router.get('/doctor', protect, restrictTo('doctor'), appointments.getDoctorAppointments);
router.get('/',       protect, restrictTo('admin'),  appointments.getAllAppointments);
router.patch('/:id/status', protect, appointments.updateAppointmentStatus);
router.delete('/:id',       protect, appointments.cancelAppointment);

module.exports = router;
*/


// ============================================================
// MIDDLEWARE (middleware/)
// ============================================================

// ─────────── middleware/auth.js ───────────
/*
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.token;

    if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'User not found or inactive' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: 'Access denied' });
  next();
};
*/


// ─────────── middleware/errorHandler.js ───────────
/*
module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal server error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // Duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    message = `${Object.keys(err.keyValue)[0]} already exists`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Token expired';  }

  if (process.env.NODE_ENV === 'development') console.error('ERROR:', err);

  res.status(statusCode).json({ success: false, message, ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) });
};
*/


// ─────────── middleware/upload.js ───────────
/*
const multer    = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'medicare', allowed_formats: ['jpg','jpeg','png','webp'], transformation: [{ width: 500, height: 500, crop: 'fill' }] },
});

module.exports = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
*/


// ============================================================
// UTILITIES (utils/)
// ============================================================

// ─────────── utils/sendEmail.js ───────────
/*
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const templates = {
  welcome: ({ name }) => ({
    subject: `Welcome to MediCare, ${name}!`,
    html: `<h2>Welcome, ${name}!</h2><p>Your MediCare account is ready. Book your first appointment today.</p>`,
  }),
  appointmentConfirm: ({ appointment }) => ({
    subject: 'Appointment Booking Received',
    html: `<h2>Appointment Confirmation</h2>
      <p>Your appointment has been received and is pending confirmation.</p>
      <p><strong>Doctor:</strong> Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}</p>
      <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${appointment.timeSlot}</p>`,
  }),
};

module.exports = async ({ to, subject, template, data }) => {
  const content = templates[template]?.(data) || { subject, html: '<p>MediCare notification</p>' };
  await transporter.sendMail({
    from: `"MediCare Hospital" <${process.env.EMAIL_FROM}>`,
    to,
    subject: content.subject || subject,
    html: content.html,
  });
};
*/


// ─────────── utils/validators.js ───────────
/*
const Joi = require('joi');

exports.registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName:  Joi.string().min(2).max(50).required(),
  email:     Joi.string().email().required(),
  password:  Joi.string().min(8).pattern(/^(?=.*[A-Za-z])(?=.*\d)/).required()
             .messages({ 'string.pattern.base': 'Password must contain letters and numbers' }),
  phone:     Joi.string().pattern(/^\+?[\d\s\-()]{10,15}$/),
  role:      Joi.string().valid('patient','doctor','admin'),
});

exports.loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});
*/


// ─────────── config/cloudinary.js ───────────
/*
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
module.exports = cloudinary;
*/


// ─────────── config/database.js ───────────
/*
const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  });
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
*/


// ─────────── Seed data (utils/seedData.js) ───────────
/*
const seedDoctors = [
  {
    firstName: 'James', lastName: 'Harrington',
    email: 'j.harrington@medicare.com', password: 'Doctor123!',
    role: 'doctor',
    doctorProfile: {
      specialization: 'Cardiology', experience: 22, consultationFee: 250,
      licenseNumber: 'NY-CARD-2001-JH',
      qualifications: [{ degree: 'MD', institution: 'Johns Hopkins', year: 2001 }],
    }
  },
  {
    firstName: 'Sarah', lastName: 'Chen',
    email: 's.chen@medicare.com', password: 'Doctor123!',
    role: 'doctor',
    doctorProfile: {
      specialization: 'Neurology', experience: 18, consultationFee: 220,
      licenseNumber: 'NY-NEUR-2005-SC',
    }
  },
];

const adminUser = {
  firstName: 'Admin', lastName: 'Medicare',
  email: 'admin@medicare.com', password: 'Admin@Medicare2025',
  role: 'admin',
};

// Run: node utils/seedData.js
*/