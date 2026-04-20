const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// FONCTION DEBUG : C'est ici que tu vas voir le vrai nom du modèle
async function checkModels() {
    try {
        const models = await genAI.listModels();
        console.log("--- MODÈLES DISPONIBLES DANS TON COMPTE ---");
        models.models.forEach(m => console.log(m.name));
        console.log("--------------------------------------------");
    } catch (e) {
        console.error("Impossible de lister les modèles:", e);
    }
}
checkModels();

app.post('/ask-ia', async (req, res) => {
    try {
        const userMessage = req.body.message;
        // Ici, on met le nom "gemini-1.5-flash"
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(userMessage);
        res.json({ response: result.response.text() });
    } catch (error) {
        console.error("Erreur Gemini:", error);
        res.status(500).json({ error: "Erreur IA" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur prêt sur le port ${PORT}`));