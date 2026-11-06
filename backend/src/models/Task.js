import mongoose from 'mongoose'

/**
 * Compute ISO week ID string e.g. "2026-W45" from a Date
 * Week starts on Monday (ISO 8601)
 */
function computeWeekId(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  // Thursday of current week (ISO: week belongs to the year containing its Thursday)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const year = d.getFullYear()
  const jan1 = new Date(year, 0, 1)
  const week = Math.ceil((((d - jan1) / 86400000) + jan1.getDay() + 1) / 7)
  return `${year}-W${String(week).padStart(2, '0')}`
}

// ─── Sub-schema for future extensibility (e.g. subtasks) ────────────────────
const subtaskSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
)

// ─── Main Task Schema ────────────────────────────────────────────────────────
const taskSchema = new mongoose.Schema(
  {
    title: {
      type:      String,
      required:  [true, 'Title is required'],
      trim:      true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type:    String,
      trim:    true,
      default: '',
    },

    dateTime: {
      type:     Date,
      required: [true, 'Date & time is required'],
    },

    // Derived from dateTime — ISO week string "YYYY-Www"
    weekId: {
      type:  String,
      index: true,
    },

    priority: {
      type:    String,
      enum:    {
        values:  ['Low', 'Medium', 'High'],
        message: 'Priority must be Low, Medium, or High',
      },
      default: 'Medium',
    },

    status: {
      type:    String,
      enum:    {
        values:  ['in-progress', 'completed'],
        message: 'Status must be in-progress or completed',
      },
      default: 'in-progress',
    },

    subtasks: {
      type:    [subtaskSchema],
      default: [],
    },
  },
  {
    timestamps: true,           // adds createdAt, updatedAt automatically
    versionKey: false,          // removes __v field
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
)

// ─── Indexes ─────────────────────────────────────────────────────────────────
taskSchema.index({ dateTime: -1 })
taskSchema.index({ status: 1 })
taskSchema.index({ title: 'text', description: 'text' })   // full-text search

// ─── Virtual: isOverdue ───────────────────────────────────────────────────────
taskSchema.virtual('isOverdue').get(function () {
  return this.status !== 'completed' && this.dateTime < new Date()
})

// ─── Pre-save hook: auto-compute weekId whenever dateTime changes ─────────────
taskSchema.pre('save', function (next) {
  if (this.isModified('dateTime') || this.isNew) {
    this.weekId = computeWeekId(this.dateTime)
  }
  next()
})

// ─── Pre-findOneAndUpdate hook: recompute weekId if dateTime is updated ────────
taskSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate()
  if (update.dateTime) {
    update.weekId = computeWeekId(update.dateTime)
    this.setUpdate(update)
  }
  next()
})

// ─── Static methods ───────────────────────────────────────────────────────────
taskSchema.statics.getWeeklyGrouped = async function () {
  const tasks = await this.find().sort({ dateTime: -1 }).lean()

  const weekMap = {}
  for (const task of tasks) {
    const wid = task.weekId || computeWeekId(task.dateTime)
    if (!weekMap[wid]) {
      weekMap[wid] = {
        weekId:         wid,
        tasks:          [],
        openCount:      0,
        completedCount: 0,
      }
    }
    weekMap[wid].tasks.push(task)
    if (task.status === 'completed') weekMap[wid].completedCount++
    else weekMap[wid].openCount++
  }

  return Object.values(weekMap).sort((a, b) => b.weekId.localeCompare(a.weekId))
}

taskSchema.statics.searchTasks = async function (query) {
  return this.find({
    $or: [
      { title:       { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ],
  })
    .sort({ dateTime: -1 })
    .lean()
}

const Task = mongoose.model('Task', taskSchema)

export default Task
