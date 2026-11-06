import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { getWeeklyTasks, createTask, deleteTask, updateTaskStatus } from '../api/taskApi'
import AddTaskModal from '../components/AddTaskModal'
import EditTaskModal from '../components/EditTaskModal'
import TaskRow from '../components/TaskRow'

dayjs.extend(weekOfYear)

const DAY_ABBR = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function buildWeekDays(anchor) {
  const mon = anchor.startOf('week').add(1, 'day')
  return Array.from({ length: 7 }, (_, i) => mon.add(i, 'day'))
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const today = dayjs()
  const [selectedDay, setSelectedDay] = useState(today)
  const [weekAnchor, setWeekAnchor] = useState(today)
  const [allTasks, setAllTasks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editTaskId, setEditTaskId] = useState(null)
  const [loading, setLoading] = useState(true)

  const weekDays = buildWeekDays(weekAnchor)

  const fetchTasks = useCallback(async () => {
    try {
      const weeks = await getWeeklyTasks()
      setAllTasks(weeks.flatMap(w => w.tasks || []))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const todayTasks = allTasks.filter(t =>
    dayjs(t.dateTime).format('YYYY-MM-DD') === selectedDay.format('YYYY-MM-DD')
  )

  const currentWeek = `${today.year()}-W${String(today.week()).padStart(2, '0')}`
  const weekTasks   = allTasks.filter(t => t.weekId === currentWeek)
  const completedCount = weekTasks.filter(t => t.status === 'completed').length
  const pendingCount   = weekTasks.filter(t => t.status !== 'completed').length
  const weekPct = weekTasks.length ? Math.round((completedCount / weekTasks.length) * 100) : 0

  const handleToggle = async (id, status) => {
    await updateTaskStatus(id, status === 'completed' ? 'in-progress' : 'completed')
    fetchTasks()
  }
  const handleDelete = async (id) => { await deleteTask(id); fetchTasks() }
  const handleCreate = async (data) => { await createTask(data); setShowModal(false); fetchTasks() }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">

      {/* ── Search bar ── */}
      <div className="px-4 pt-8 pb-2 flex-shrink-0">
        <button
          onClick={() => navigate('/search')}
          className="w-full flex items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 gap-3 text-left"
        >
          <span className="flex-1 text-gray-400 text-sm">Search for a task</span>
          <SearchIcon />
        </button>
      </div>

      {/* ── Week navigation ── */}
      <div className="px-4 pt-3 pb-1 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setWeekAnchor(w => w.subtract(7, 'day'))} className="p-1 text-gray-400">
            <ChevronLeft />
          </button>
          <span className="text-xs text-gray-400 font-medium">
            {weekDays[0].format('MMM D')} – {weekDays[6].format('MMM D, YYYY')}
          </span>
          <button onClick={() => setWeekAnchor(w => w.add(7, 'day'))} className="p-1 text-gray-400">
            <ChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => {
            const sel = day.format('YYYY-MM-DD') === selectedDay.format('YYYY-MM-DD')
            const isToday = day.format('YYYY-MM-DD') === today.format('YYYY-MM-DD')
            const hasTasks = allTasks.some(t =>
              dayjs(t.dateTime).format('YYYY-MM-DD') === day.format('YYYY-MM-DD')
            )
            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDay(day)}
                className="flex flex-col items-center gap-0.5"
              >
                <span className="text-[10px] text-gray-400">{DAY_ABBR[day.day()]}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-sm transition-all
                  ${sel ? 'bg-primary text-white shadow-md' : isToday ? 'text-primary' : 'text-gray-600'}`}>
                  {day.format('D')}
                </div>
                <span className={`w-1.5 h-1.5 rounded-full ${hasTasks ? (sel ? 'bg-white' : 'bg-primary') : 'bg-transparent'}`} />
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="px-4 pt-3 pb-1 grid grid-cols-2 gap-3 flex-shrink-0">
        {/* Task Complete */}
        <div className="bg-primary-light rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs text-primary font-semibold">Task Complete</span>
          </div>
          <p className="text-4xl font-bold text-gray-800 leading-none">
            {String(completedCount).padStart(2, '0')}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">This Week</p>
        </div>

        {/* Task Pending */}
        <div className="bg-danger-light rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-danger rounded-lg flex items-center justify-center flex-shrink-0">
              <XIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs text-danger font-semibold">Task Pending</span>
          </div>
          <p className="text-4xl font-bold text-gray-800 leading-none">
            {String(pendingCount).padStart(2, '0')}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">This Week</p>
        </div>
      </div>

      {/* ── Weekly Progress ── */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <h2 className="text-[15px] font-bold text-gray-800 mb-2">Weekly Progress</h2>
        <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${weekPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{weekPct}% completed</p>
      </div>

      {/* ── Tasks Today ── */}
      <div className="px-4 pt-2 pb-0 flex items-center justify-between flex-shrink-0">
        <h2 className="text-[15px] font-bold text-gray-800">
          Tasks — {selectedDay.format('MMM D')}
        </h2>
        <span className="text-xs text-gray-400">{todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Scrollable task list */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-2 pb-28">
        {loading ? (
          <div className="flex justify-center pt-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : todayTasks.length === 0 ? (
          <div className="flex flex-col items-center pt-12 text-center">
            <span className="text-4xl mb-3">📋</span>
            <p className="text-gray-400 text-sm">No tasks for {selectedDay.format('dddd')}</p>
            <p className="text-gray-300 text-xs mt-1">Tap + to add one</p>
          </div>
        ) : (
          todayTasks.map(task => (
            <TaskRow
              key={task._id}
              task={task}
              onToggle={() => handleToggle(task._id, task.status)}
              onDelete={() => handleDelete(task._id)}
              onEdit={() => setEditTaskId(task._id)}
            />
          ))
        )}
      </div>

      {/* ── FAB ── */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
        <button
          onClick={() => setShowModal(true)}
          className="pointer-events-auto w-14 h-14 bg-primary rounded-full shadow-xl flex items-center justify-center text-white active:scale-95 transition-transform"
          aria-label="Add task"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {showModal && (
        <AddTaskModal
          selectedDate={selectedDay}
          onClose={() => setShowModal(false)}
          onSave={handleCreate}
        />
      )}

      {editTaskId && (
        <EditTaskModal
          taskId={editTaskId}
          onClose={() => setEditTaskId(null)}
          onSaved={() => { setEditTaskId(null); fetchTasks() }}
        />
      )}
    </div>
  )
}

const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
  </svg>
)
const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
)
const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
  </svg>
)
const ChevronLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)
const ChevronRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)
