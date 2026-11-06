import dayjs from 'dayjs'

const PRIORITY_BADGE = {
  High:   'bg-red-50 text-red-400',
  Medium: 'bg-yellow-50 text-yellow-500',
  Low:    'bg-green-50 text-green-500',
}

export default function TaskRow({ task, onToggle, onDelete, onEdit }) {
  const done = task.status === 'completed'

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Checkbox */}
      <button
        onClick={onToggle}
        aria-label={done ? 'Mark incomplete' : 'Mark complete'}
        className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors
          ${done ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}
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
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-gray-400">
            {dayjs(task.dateTime).format('h:mm A')}
          </span>
          {task.priority && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${PRIORITY_BADGE[task.priority] || ''}`}>
              {task.priority}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-0.5 flex-shrink-0">
        <button onClick={onDelete} aria-label="Delete task">
          <svg className="w-4 h-4 text-gray-300 hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h4a1 1 0 011 1v0M9 7H5m14 0h-4" />
          </svg>
        </button>
        <button onClick={onEdit} aria-label="Edit task">
          <svg className="w-4 h-4 text-gray-300 hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
