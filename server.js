const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Autorise ton app Flutter Web à appeler ce serveur

app.post('/ask-ia', async (req, res) => {
    try {
        const userMessage = req.body.message; // On récupère le message envoyé par Flutter

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.1-8b-instant", // On précise le modèle ici
            messages: [
                { role: "system", content: "Tu es un assistant traducteur pour la langue Dida." },
                { role: "user", content: userMessage }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        // Regarde tes logs Render, tu verras ce message s'afficher !
        console.error("Erreur détaillée Groq:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "L'IA a eu un petit souci technique." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));