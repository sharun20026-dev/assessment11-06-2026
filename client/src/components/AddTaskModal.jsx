import { useState } from 'react'
import dayjs from 'dayjs'

export default function AddTaskModal({ selectedDate, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '',
    startTime: '',
    endTime: '',
    date: selectedDate ? selectedDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
    description: '',
    priority: 'Medium',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = true
    if (!form.startTime) e.startTime = true
    if (!form.date) e.date = true
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const dateTime = new Date(`${form.date}T${form.startTime}:00`).toISOString()
      await onSave({ title: form.title.trim(), description: form.description, dateTime, priority: 'Medium' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Dim backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Bottom sheet */}
      <div className="relative bg-white rounded-t-3xl z-10 w-full max-w-[430px] mx-auto">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-6 pt-2 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-800">Add New Task</h2>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-gray-400" aria-label="Close">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Task title */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-400 mb-1">Task title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Doing Homework"
              className={`w-full pb-2 border-b text-sm text-gray-700 outline-none bg-transparent placeholder-gray-300 transition-colors
                ${errors.title ? 'border-red-400' : 'border-gray-200 focus:border-primary'}`}
            />
          </div>

          {/* Set Time */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-400 mb-2">Set Time</label>
            <div className="flex gap-3">
              <div className={`flex-1 flex items-center gap-2 border rounded-xl px-3 py-2.5 ${errors.startTime ? 'border-red-300' : 'border-gray-200'}`}>
                <ClockIcon />
                <input
                  type="time"
                  value={form.startTime}
                  onChange={e => set('startTime', e.target.value)}
                  className="flex-1 text-sm text-gray-600 outline-none bg-transparent min-w-0"
                />
                <span className="text-[10px] text-gray-300 flex-shrink-0">Start</span>
              </div>
              <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
                <ClockIcon />
                <input
                  type="time"
                  value={form.endTime}
                  onChange={e => set('endTime', e.target.value)}
                  className="flex-1 text-sm text-gray-600 outline-none bg-transparent min-w-0"
                />
                <span className="text-[10px] text-gray-300 flex-shrink-0">Ends</span>
              </div>
            </div>
          </div>

          {/* Set Date */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-400 mb-2">Set Date</label>
            <div className={`flex items-center border rounded-xl px-3 py-2.5 ${errors.date ? 'border-red-300' : 'border-gray-200'}`}>
              <input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className="flex-1 text-sm text-gray-600 outline-none bg-transparent"
              />
              <CalendarIcon />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-400 mb-2">Description</label>
            <div className="border border-gray-200 rounded-xl px-3 py-3 focus-within:border-primary transition-colors">
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Add Description"
                rows={2}
                className="w-full text-sm text-gray-600 outline-none resize-none bg-transparent placeholder-gray-300"
              />
            </div>
          </div>

          {/* Priority pills */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-400 mb-2">Priority</label>
            <div className="flex gap-2">
              {['Low', 'Medium', 'High'].map(p => {
                const active = form.priority === p
                const colors = {
                  Low: 'bg-green-50 text-green-600 border-green-200',
                  Medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
                  High: 'bg-red-50 text-red-500 border-red-200',
                }
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set('priority', p)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all
                      ${active ? colors[p] + ' ring-1 ring-offset-0' : 'border-gray-200 text-gray-400'}`}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-4 bg-primary text-white rounded-2xl font-semibold text-sm tracking-wide active:opacity-80 disabled:opacity-60 transition-opacity"
          >
            {saving ? 'Creating...' : 'Create task'}
          </button>
        </div>
      </div>
    </div>
  )
}

const ClockIcon = () => (
  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const CalendarIcon = () => (
  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)
