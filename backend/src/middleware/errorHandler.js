export const errorHandler = (err, req, res, next) => {
  console.error('❌', err.message)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ message: messages.join(', ') })
  }

  // Mongoose bad ObjectId (e.g. /tasks/bad-id)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ message: 'Invalid task ID format' })
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return res.status(409).json({ message: `Duplicate value for ${field}` })
  }

  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
}
