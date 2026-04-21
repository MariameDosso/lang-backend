// routes/dida.js
import express from 'express';
import axios from 'axios';
import FormData from 'form-data';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const PYTHON_API = 'http://localhost:8000';

// 🔊 TTS — Texte Dida → Audio
router.post('/tts', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_API}/api/tts`, {
      text: req.body.text
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🎤 ASR — Audio → Texte Dida
router.post('/asr', upload.single('file'), async (req, res) => {
  try {
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: 'audio.wav',
      contentType: 'audio/wav'
    });
    const response = await axios.post(`${PYTHON_API}/api/asr`, form, {
      headers: form.getHeaders()
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🌍 Traduction Dida ↔ Français
router.post('/translate', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_API}/api/translate`, {
      text: req.body.text,
      source_lang: req.body.source_lang,
      target_lang: req.body.target_lang
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;