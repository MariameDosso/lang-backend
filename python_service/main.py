from fastapi import FastAPI, UploadFile
from fastapi.responses import JSONResponse
from transformers import (
    VitsModel, AutoTokenizer,
    Wav2Vec2ForCTC, AutoProcessor,
    NllbTokenizer, AutoModelForSeq2SeqLM
)
import torch, scipy, base64, numpy as np
import soundfile as sf
from io import BytesIO

app = FastAPI()

# ─── Chargement des modèles ───
print("Chargement TTS Dida Yocoboué...")
tts_model = VitsModel.from_pretrained("facebook/mms-tts-gud")
tts_tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-gud")

print("Chargement ASR...")
asr_processor = AutoProcessor.from_pretrained("facebook/mms-1b-all")
asr_model = Wav2Vec2ForCTC.from_pretrained("facebook/mms-1b-all")
asr_processor.tokenizer.set_target_lang("gud")
asr_model.load_adapter("gud")

print("Chargement Traduction NLLB...")
nllb_tokenizer = NllbTokenizer.from_pretrained("facebook/nllb-200-distilled-600M")
nllb_model = AutoModelForSeq2SeqLM.from_pretrained("facebook/nllb-200-distilled-600M")

# ─── TTS ───
@app.post("/api/tts")
async def text_to_speech(payload: dict):
    text = payload["text"]
    inputs = tts_tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        waveform = tts_model(**inputs).waveform.squeeze()
    buffer = BytesIO()
    scipy.io.wavfile.write(buffer, rate=tts_model.config.sampling_rate, data=waveform.numpy())
    audio_b64 = base64.b64encode(buffer.getvalue()).decode()
    return {"audio_base64": audio_b64, "sample_rate": tts_model.config.sampling_rate}

# ─── ASR ───
@app.post("/api/asr")
async def speech_to_text(file: UploadFile):
    audio_bytes = await file.read()
    audio_array, sr = sf.read(BytesIO(audio_bytes))
    if sr != 16000:
        import librosa
        audio_array = librosa.resample(audio_array, orig_sr=sr, target_sr=16000)
    inputs = asr_processor(audio_array, sampling_rate=16000, return_tensors="pt")
    with torch.no_grad():
        logits = asr_model(**inputs).logits
    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = asr_processor.batch_decode(predicted_ids)[0]
    return {"transcription": transcription}

# ─── Traduction ───
@app.post("/api/translate")
async def translate(payload: dict):
    text = payload["text"]
    source_lang = payload.get("source_lang", "fra_Latn")
    target_lang = payload.get("target_lang", "fra_Latn")
    inputs = nllb_tokenizer(text, return_tensors="pt", src_lang=source_lang)
    translated = nllb_model.generate(
        **inputs,
        forced_bos_token_id=nllb_tokenizer.lang_code_to_id[target_lang]
    )
    result = nllb_tokenizer.decode(translated[0], skip_special_tokens=True)
    return {"translation": result}

# ─── Health check ───
@app.get("/")
async def root():
    return {"status": "ok", "message": "API Dida opérationnelle !"}