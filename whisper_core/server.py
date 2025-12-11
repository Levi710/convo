
import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import whisper

app = FastAPI()

# Add ffmpeg to PATH manually since winget updates might not propagate immediately
ffmpeg_path = r"C:\Users\ayush\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin"
if os.path.exists(ffmpeg_path):
    os.environ["PATH"] += os.pathsep + ffmpeg_path

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model globally on startup to avoid reloading per request
# Using "base" model as a good balance of speed and accuracy
print("Loading Whisper model...")
model = whisper.load_model("base")
print("Whisper model loaded.")


# Helper to convert seconds to VTT timestamp
def format_timestamp(seconds: float):
    x = seconds
    hours = int(x // 3600)
    x %= 3600
    minutes = int(x // 60)
    x %= 60
    seconds = int(x)
    milliseconds = int((x - seconds) * 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02}.{milliseconds:03}"

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    # Create a temporary file to save the uploaded audio
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        temp_path = temp_file.name

    try:
        # Transcribe
        print("\n" + "="*50)
        print(f"🚀 RECEIVED VIDEO: {file.filename}")
        print("⏳ Processing started... (AI is listening & Translating to English)")
        print("="*50 + "\n")
        
        # task="translate" forces output to be in English
        result = model.transcribe(temp_path, task="translate")
        
        # Generate VTT
        vtt_output = "WEBVTT\n\n"
        for segment in result["segments"]:
            start = format_timestamp(segment["start"])
            end = format_timestamp(segment["end"])
            text = segment["text"].strip()
            vtt_output += f"{start} --> {end}\n{text}\n\n"
            
            # Print live progress for the user to see
            print(f"[{start} -> {end}] {text[:50]}...")

        print("\n" + "="*50)
        print("✅ DONE! Sending subtitles back to phone.")
        print("="*50 + "\n")

        return {
            "text": result["text"], 
            "vtt": vtt_output,
            "usage": "Transcribed successfully"
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    # Use PORT environment variable if available (Render), else default to 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
