const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5001;


app.use(cors());
app.use(express.json());


const pool = new Pool({
    user: "postgres",
    host: "127.0.0.1",
    database: "flashcard_tool",
    password: "2002",
    port: 5432,
});




app.get('/api/flashcards', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM flashcards');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching flashcards:', err);
        res.status(500).json('Error fetching flashcards');
    }
});


app.post('/api/flashcards', async (req, res) => {
    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json('Question and answer are required');
    }

    try {
        const result = await pool.query('INSERT INTO flashcards (question, answer) VALUES ($1, $2) RETURNING *', [question, answer]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding flashcard:', err.message);  // Log the error message
        res.status(500).json({ error: 'Error adding flashcard', details: err.message });
    }
});

app.delete('/api/flashcards/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM flashcards WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json('Flashcard not found');
        }
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting flashcard:', err.message);
        res.status(500).json({ error: 'Error deleting flashcard', details: err.message });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
