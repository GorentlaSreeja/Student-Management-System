const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

exports.index = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const requestedDate = String(req.query.date || today);
    const date = validDate(requestedDate) && requestedDate <= today ? requestedDate : today;
    const [students, records, history] = await Promise.all([
      Student.find({ status: 'Active' }).sort({ fullName: 1 }).lean(),
      Attendance.find({ date }).lean(),
      Attendance.aggregate([
        { $match: { date: { $lte: today } } },
        { $group: {
          _id: '$date',
          present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } },
          total: { $sum: 1 }
        } },
        { $sort: { _id: -1 } },
        { $limit: 30 }
      ])
    ]);
    const statusByStudent = new Map(records.map(record => [String(record.student), record.status]));
    res.render('attendance', {
      title: 'Attendance', date, today, students, statusByStudent,
      markedCount: records.length, history, success: req.query.success || null
    });
  } catch (error) { next(error); }
};

exports.mark = async (req, res, next) => {
  try {
    const date = String(req.body.date || '');
    const today = new Date().toISOString().slice(0, 10);
    if (!validDate(date) || date > today) {
      return res.status(400).send('Please choose a valid date that is not in the future.');
    }
    const statuses = req.body.status || {};
    const students = await Student.find({ status: 'Active' }).select('_id').lean();
    const allowed = new Set(students.map(student => String(student._id)));
    const operations = [];
    for (const [studentId, status] of Object.entries(statuses)) {
      if (!allowed.has(studentId) || !['Present', 'Absent'].includes(status)) continue;
      operations.push({ updateOne: {
        filter: { student: studentId, date },
        update: { $set: { status, markedBy: req.session.userId } },
        upsert: true
      } });
    }
    if (operations.length) await Attendance.bulkWrite(operations, { ordered: false });
    res.redirect(`/attendance?date=${encodeURIComponent(date)}&success=${encodeURIComponent(`Attendance saved for ${operations.length} student(s).`)}`);
  } catch (error) { next(error); }
};
