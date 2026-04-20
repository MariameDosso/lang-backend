const express = require('express');
const cors = require('cors');
// Import de la bibliothèque Google Gemini
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

// Initialisation de Gemini
// Assure-toi que GEMINI_API_KEY est bien configuré sur Render
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/ask-ia', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        // On choisit le modèle 'gemini-1.5-flash' (très rapide et gratuit)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        // Appel à l'IA
        const result = await model.generateContent(userMessage);
        const responseText = result.response.text();

        // On renvoie la réponse au format JSON attendu par ton app Flutter
        res.json({ response: responseText });

    } catch (error) {
        console.error("Erreur Gemini:", error);
        res.status(500).json({ error: "L'IA a eu un souci technique." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));