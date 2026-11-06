import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const getWeeklyTasks = () => api.get('/tasks/weekly').then(r => r.data)
export const getTasksByWeek  = (weekId) => api.get(`/tasks/week/${weekId}`).then(r => r.data)
export const getTaskById     = (id) => api.get(`/tasks/${id}`).then(r => r.data)
export const createTask      = (data) => api.post('/tasks', data).then(r => r.data)
export const updateTask      = (id, data) => api.put(`/tasks/${id}`, data).then(r => r.data)
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status }).then(r => r.data)
export const deleteTask      = (id) => api.delete(`/tasks/${id}`).then(r => r.data)
export const searchTasks     = (q) => api.get(`/tasks/search?q=${encodeURIComponent(q)}`).then(r => r.data)
