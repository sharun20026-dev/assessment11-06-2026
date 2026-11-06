import Task from '../models/Task.js'

// GET /api/tasks/weekly
export const getWeeklyTasks = async (req, res, next) => {
  try {
    const weeks = await Task.getWeeklyGrouped()
    res.json(weeks)
  } catch (err) { next(err) }
}

// GET /api/tasks/week/:weekId
export const getTasksByWeek = async (req, res, next) => {
  try {
    const tasks = await Task.find({ weekId: req.params.weekId })
      .sort({ dateTime: 1 })
      .lean()
    res.json(tasks)
  } catch (err) { next(err) }
}

// GET /api/tasks/search?q=
export const searchTasks = async (req, res, next) => {
  try {
    const { q } = req.query
    if (!q?.trim()) return res.json([])
    const tasks = await Task.searchTasks(q.trim())
    res.json(tasks)
  } catch (err) { next(err) }
}

// GET /api/tasks/:id
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).lean()
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json(task)
  } catch (err) { next(err) }
}

// POST /api/tasks
export const createTask = async (req, res, next) => {
  try {
    const { title, description, dateTime, priority } = req.body
    const task = await Task.create({ title, description, dateTime, priority })
    res.status(201).json(task)
  } catch (err) { next(err) }
}

// PUT /api/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, dateTime, priority } = req.body
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })

    task.title       = title       ?? task.title
    task.description = description ?? task.description
    task.dateTime    = dateTime    ?? task.dateTime
    task.priority    = priority    ?? task.priority

    await task.save()   // triggers pre-save → recomputes weekId
    res.json(task)
  } catch (err) { next(err) }
}

// PATCH /api/tasks/:id/status
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json(task)
  } catch (err) { next(err) }
}

// DELETE /api/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json({ message: 'Task deleted successfully' })
  } catch (err) { next(err) }
}
