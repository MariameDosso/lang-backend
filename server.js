// server.js - Version améliorée pour Langivoire
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import didaRoutes from './routes/dida.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/dida', didaRoutes);
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// System Prompt puissant pour Langivoire
const systemPrompt = `Tu es un professeur de langues ivoiriennes patient, encourageant et pédagogue.
Ton nom est "Langivoire Assistant".

Tu aides les utilisateurs à apprendre :
- Le français (niveau débutant à avancé)
- Le dioula, baoulé, bété, sénoufo, attié, guéré, yacouba, etc.
- La traduction français ↔ langues locales ivoiriennes
- La prononciation, la grammaire, le vocabulaire quotidien, les expressions culturelles.

Règles importantes :
- Réponds toujours en français sauf si l'utilisateur demande explicitement en une autre langue.
- Sois clair, structuré et encourageant.
- Quand tu donnes un mot ou une phrase en langue locale, donne toujours :
  1. La phrase en langue locale
  2. La prononciation entre parenthèses
  3. La traduction en français
- Propose des exemples concrets de la vie quotidienne en Côte d'Ivoire.
- Si l'utilisateur fait une erreur, corrige-le gentiment sans le décourager.
- Pose des questions pour vérifier sa compréhension et continuer la leçon.

Commence toujours tes réponses de manière chaleureuse et motivante.`;

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
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: "Compris ! Je suis prêt à aider les utilisateurs à apprendre les langues ivoiriennes." }] },
        { role: 'user', parts: [{ text: message }] }
      ]
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

const PORT = process.env.PORT || 10000;
// Générateur de vocabulaire Dida via Gemini
app.post('/generate-vocabulary', async (req, res) => {
  try {
    const { theme } = req.body;
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Tu es un expert en langue Dida Yocoboué (code ISO: gud), 
    langue Kru de Côte d'Ivoire parlée à Guitry et Divo.
    
    Génère un vocabulaire de 10 mots en Dida Yocoboué sur le thème: "${theme}".
    
    Réponds UNIQUEMENT en JSON valide, sans markdown, sans explication:
    {
      "mots": [
        {
          "fr": "mot en français",
          "loc": "mot en Dida Yocoboué",
          "phrase": "exemple de phrase en Dida"
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);
    
    res.json({ success: true, theme, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Langivoire Assistant démarré sur le port ${PORT}`);
});