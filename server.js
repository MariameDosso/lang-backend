// server.js
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.post('/ask-ia', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: "Le champ 'message' est obligatoire" 
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message
    });

    res.json({
      success: true,
      reply: response.text
    });

  } catch (error) {
    console.error('Erreur Gemini:', error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la génération de la réponse",
      details: error.message
    });
  }
});

// Important pour Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});