import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { searchTasks, updateTaskStatus, deleteTask } from '../api/taskApi'
import EditTaskModal from '../components/EditTaskModal'

export default function SearchScreen() {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [editId, setEditId]     = useState(null)
  const debounceRef = useRef(null)
  const navigate = useNavigate()

  const doSearch = async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return }
    setLoading(true)
    try {
      const data = await searchTasks(q)
      setResults(data)
      setSearched(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleQueryChange = (val) => {
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 300)
  }

  const handleSearch = (e) => { e.preventDefault(); doSearch(query) }

  const handleToggle = async (id, status) => {
    const next = status === 'completed' ? 'in-progress' : 'completed'
    await updateTaskStatus(id, next)
    setResults(prev => prev.map(t => t._id === id ? { ...t, status: next } : t))
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    setResults(prev => prev.filter(t => t._id !== id))
  }

  const handleEditSaved = () => {
    setEditId(null)
    doSearch(query) // refresh results
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-4 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="w-8 h-8 flex items-center justify-center text-gray-700 flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <form onSubmit={handleSearch} className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 gap-2">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="Search for a task..."
            className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
          />
          {query.length > 0 && (
            <button type="button" onClick={() => handleQueryChange('')}
              className="text-gray-300 hover:text-gray-500 text-base leading-none" aria-label="Clear">
              ✕
            </button>
          )}
          <button type="submit" aria-label="Search" className="flex-shrink-0">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Results count */}
      {searched && !loading && (
        <div className="px-4 pb-2 flex-shrink-0">
          <p className="text-xs text-gray-400">
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </p>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-10">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center pt-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty initial */}
        {!searched && !loading && (
          <div className="flex flex-col items-center pt-20 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-gray-400 text-sm">Type a task name to search</p>
          </div>
        )}

        {/* No results */}
        {searched && !loading && results.length === 0 && (
          <div className="flex flex-col items-center pt-16 text-center">
            <span className="text-5xl mb-4">😕</span>
            <p className="text-gray-500 text-sm font-medium">No tasks found</p>
            <p className="text-gray-400 text-xs mt-1">Try a different keyword</p>
          </div>
        )}

        {/* Task list */}
        {!loading && results.map(task => {
          const done = task.status === 'completed'
          return (
            <div key={task._id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(task._id, task.status)}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors
                  ${done ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}
                aria-label={done ? 'Mark incomplete' : 'Mark complete'}
              >
                {done && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${done ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{task.description}</p>
                )}
                <p className="text-[11px] text-gray-400 mt-1">
                  {dayjs(task.dateTime).format('MMM D, YYYY · h:mm A')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-0.5 flex-shrink-0">
                <button onClick={() => handleDelete(task._id)} aria-label="Delete">
                  <svg className="w-4 h-4 text-gray-300 hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h4a1 1 0 011 1v0M9 7H5m14 0h-4" />
                  </svg>
                </button>
                <button onClick={() => setEditId(task._id)} aria-label="Edit">
                  <svg className="w-4 h-4 text-gray-300 hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit modal */}
      {editId && (
        <EditTaskModal
          taskId={editId}
          onClose={() => setEditId(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  )
}
