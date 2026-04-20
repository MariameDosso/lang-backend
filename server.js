// server.js
import express from 'express';
import { GoogleGenAI } from '@google/genai';   // ← Nouveau import

const app = express();
app.use(express.json());

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,   // Assure-toi que cette variable est bien dans Render
});

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",           // Meilleur choix actuel (rapide + bon)
  // model: "gemini-2.5-pro",          // Si tu veux plus de qualité (un peu plus cher)
});

app.post('/ask-ia', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Le champ 'message' est obligatoire" });
    }

    const result = await model.generateContent(message);

    // Extraction de la réponse (nouveau SDK)
    const responseText = result.text();   // ou result.response.text() selon la version exacte

    res.json({
      success: true,
      reply: responseText
    });

  } catch (error) {
    console.error("Erreur Gemini :", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la génération de réponse",
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});