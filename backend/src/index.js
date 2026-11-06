import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import taskRoutes from './routes/taskRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/tasks', taskRoutes)

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', db: 'mongodb', env: process.env.NODE_ENV })
)

app.use(errorHandler)

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  )
})
