const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

// Initialisation de l'API Gemini
// Assure-toi que la variable GEMINI_API_KEY est bien configurée sur Render
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/ask-ia', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        // Utilisation du modèle gemini-1.5-flashgemini-2.5-pro
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

        // Appel à l'IA
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const text = response.text();

        // Renvoi de la réponse
        res.json({ response: text });

    } catch (error) {
        console.error("Erreur détaillée:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));