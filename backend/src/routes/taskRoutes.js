import { Router } from 'express'
import {
  getWeeklyTasks,
  getTasksByWeek,
  searchTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/taskController.js'

const router = Router()

// Order matters: specific routes before param routes
router.get('/weekly', getWeeklyTasks)
router.get('/week/:weekId', getTasksByWeek)
router.get('/search', searchTasks)

router.get('/:id', getTaskById)
router.post('/', createTask)
router.put('/:id', updateTask)
router.patch('/:id/status', updateTaskStatus)
router.delete('/:id', deleteTask)

export default router
