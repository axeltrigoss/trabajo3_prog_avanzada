import express from 'express'
import { pool } from './db.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

// GET /tasks - Listar todas las tareas (con filtro opcional por status)
app.get('/tasks', async (req, res) => {
  const { status } = req.query

  try {
    let query = 'SELECT * FROM tasks'
    const params = []

    if (status) {
      query += ' WHERE status = $1'
      params.push(status)
    }

    query += ' ORDER BY id ASC'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /tasks/:id - Obtener una tarea por ID
app.get('/tasks/:id', async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /tasks - Crear una nueva tarea
app.post('/tasks', async (req, res) => {
  const { title, description, status, dueDate } = req.body

  if (!title) {
    return res.status(400).json({ error: 'El título es obligatorio' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, due_date)
       VALUES ($1, COALESCE($2, ''), COALESCE($3, 'pending'), $4)
       RETURNING *`,
      [title, description, status, dueDate]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /tasks/:id - Actualizar tarea (RF-04)
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params
  const { title, description, status, dueDate } = req.body

  try {
    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           due_date = COALESCE($4, due_date),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [title, description, status, dueDate, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /tasks/:id - Eliminar tarea (RF-05)
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
})
