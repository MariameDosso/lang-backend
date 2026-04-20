const express = require('express');
const cors = require('cors');
// Import de la bibliothèque Google Gemini
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

// DEBUG : Vérification de la clé API
console.log("Vérification clé API :", process.env.GEMINI_API_KEY ? "CLÉ TROUVÉE" : "CLÉ MANQUANTE OU VIDE");

// Initialisation de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/ask-ia', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        // Initialisation du modèle
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Appel à l'IA
        const result = await model.generateContent(userMessage);
        const responseText = result.response.text();

        // On renvoie la réponse
        res.json({ response: responseText });

    } catch (error) {
        console.error("Erreur Gemini détaillée:", error);
        res.status(500).json({ error: "L'IA a eu un souci technique." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));