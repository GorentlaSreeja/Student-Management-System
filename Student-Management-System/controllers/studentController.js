const mongoose = require('mongoose');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildStudentPayload(body) {
  const payload = {
    studentId: String(body.studentId || '').trim().toUpperCase(),
    fullName: String(body.fullName || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    department: String(body.department || '').trim(),
    year: String(body.year || '').trim(),
    phone: String(body.phone || '').trim(),
    status: String(body.status || 'Active').trim()
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9+()\s-]{7,20}$/;
  const allowedYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  if (!payload.studentId || !payload.fullName || !payload.email || !payload.department || !payload.year) {
    const error = new Error('Please complete all required fields.');
    error.name = 'InputError';
    throw error;
  }
  if (payload.fullName.length > 100 || payload.studentId.length > 30) {
    const error = new Error('Student name or ID is too long.');
    error.name = 'InputError';
    throw error;
  }
  if (!emailPattern.test(payload.email)) {
    const error = new Error('Please enter a valid email address.');
    error.name = 'InputError';
    throw error;
  }
  if (payload.phone && !phonePattern.test(payload.phone)) {
    const error = new Error('Please enter a valid phone number.');
    error.name = 'InputError';
    throw error;
  }
  if (!allowedYears.includes(payload.year)) {
    const error = new Error('Please select a valid academic year.');
    error.name = 'InputError';
    throw error;
  }
  if (!['Active', 'Inactive'].includes(payload.status)) {
    const error = new Error('Please select a valid student status.');
    error.name = 'InputError';
    throw error;
  }
  return payload;
}

function renderFormError(res, { status = 400, title, student, error, formAction }) {
  return res.status(status).render('student-form', {
    title,
    student,
    error,
    formAction
  });
}

exports.dashboard = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 80);
    const safeQuery = escapeRegex(q);
    const filter = q ? { $or: [
      { fullName: { $regex: safeQuery, $options: 'i' } },
      { studentId: { $regex: safeQuery, $options: 'i' } },
      { email: { $regex: safeQuery, $options: 'i' } },
      { department: { $regex: safeQuery, $options: 'i' } }
    ] } : {};
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = 10;
    const [students, matching, total, active, inactive] = await Promise.all([
      Student.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
      Student.countDocuments(filter), Student.countDocuments(),
      Student.countDocuments({ status: 'Active' }), Student.countDocuments({ status: 'Inactive' })
    ]);
    const totalPages = Math.max(1, Math.ceil(matching / pageSize));
    res.render('dashboard', {
      title: 'Dashboard', students, stats: { total, active, inactive }, q, page,
      totalPages, matching, error: null, success: req.query.success || null
    });
  } catch (error) { next(error); }
};

exports.view = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).render('404', { title: 'Student not found' });
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).render('404', { title: 'Student not found' });
    res.render('student-detail', { title: 'Student details', student });
  } catch (error) { next(error); }
};

exports.showNew = (req, res) => {
  res.render('student-form', {
    title: 'Add student', student: {}, error: null, formAction: '/students'
  });
};

exports.create = async (req, res, next) => {
  try {
    await Student.create(buildStudentPayload(req.body));
    return res.redirect('/dashboard?success=' + encodeURIComponent('Student added successfully.'));
  } catch (error) {
    if (error.code === 11000) {
      return renderFormError(res, {
        status: 409, title: 'Add student', student: req.body,
        error: 'That student ID is already in use.', formAction: '/students'
      });
    }
    if (error.name === 'ValidationError' || error.name === 'InputError') {
      return renderFormError(res, {
        status: 400, title: 'Add student', student: req.body,
        error: error.message, formAction: '/students'
      });
    }
    return next(error);
  }
};

exports.showEdit = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).render('404', { title: 'Student not found' });
    }
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).render('404', { title: 'Student not found' });

    return res.render('student-form', {
      title: 'Edit student', student, error: null,
      formAction: `/students/${student._id}?_method=PUT`
    });
  } catch (error) {
    return next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).render('404', { title: 'Student not found' });
    }
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      buildStudentPayload(req.body),
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).render('404', { title: 'Student not found' });

    return res.redirect('/dashboard?success=' + encodeURIComponent('Student updated successfully.'));
  } catch (error) {
    const formAction = `/students/${req.params.id}?_method=PUT`;
    if (error.code === 11000) {
      return renderFormError(res, {
        status: 409, title: 'Edit student', student: { ...req.body, _id: req.params.id },
        error: 'That student ID is already in use.', formAction
      });
    }
    if (error.name === 'ValidationError' || error.name === 'InputError') {
      return renderFormError(res, {
        status: 400, title: 'Edit student', student: { ...req.body, _id: req.params.id },
        error: error.message, formAction
      });
    }
    return next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).render('404', { title: 'Student not found' });
    }
    const student = await Student.findByIdAndDelete(req.params.id);
    if (student) await Attendance.deleteMany({ student: student._id });
    if (!student) return res.status(404).render('404', { title: 'Student not found' });

    return res.redirect('/dashboard?success=' + encodeURIComponent('Student deleted successfully.'));
  } catch (error) {
    return next(error);
  }
};
