"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [vttUrl, setVttUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Create local URL for immediate playback
      const url = URL.createObjectURL(selectedFile);
      setVideoUrl(url);
      setVttUrl(null); // Reset subtitles for new file
      setSubtitles("");
    }
  };

  const cleanSubtitles = (rawText: string) => {
    return rawText.trim();
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setSubtitles("");
    setVttUrl(null);

    const formData = new FormData();
    formData.append("file", file);

    // Hardcoded backend URL (Persistent Subdomain)
    const apiUrl = "https://ayush-app-backend.loca.lt";

    try {
      const response = await fetch(`${apiUrl}/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process video");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setSubtitles(cleanSubtitles(data.text));

      // Create VTT Blob URL
      if (data.vtt) {
        const vttBlob = new Blob([data.vtt], { type: "text/vtt" });
        const vttUrl = URL.createObjectURL(vttBlob);
        setVttUrl(vttUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <main className="max-w-4xl mx-auto px-6 py-20 flex flex-col gap-12">
        {/* Header */}
        <div className="space-y-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Subtitle Generator
          </h1>
          <p className="text-lg text-zinc-400 max-w-lg mx-auto">
            Upload your video. AI will generate subtitles and play them for you.
          </p>
        </div>

        {/* Video Player Section */}
        {videoUrl && (
          <div className="w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
            <video
              controls
              className="w-full h-full"
              src={videoUrl}
              crossOrigin="anonymous"
            >
              {vttUrl && (
                <track
                  kind="subtitles"
                  src={vttUrl}
                  srcLang="en"
                  label="English (AI)"
                  default
                />
              )}
            </video>
          </div>
        )}

        {/* Upload Section */}
        <div className="flex flex-col items-center gap-8">
          <div className="relative group w-full max-w-xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-8 transition-all hover:bg-zinc-800/50">
              <label className="flex flex-col items-center justify-center gap-4 cursor-pointer w-full h-40 border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg transition-colors">
                <input
                  type="file"
                  accept="video/*,audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <span className="text-zinc-200 font-medium truncate max-w-[200px]">{file.name}</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <span className="text-zinc-400">Click to upload or drag and drop</span>
                  </>
                )}
              </label>

              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full mt-6 bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Processing Video..." : "Generate Subtitles"}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {(subtitles || error) && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error ? (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-center">
                {error}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-zinc-200">Transcription Text</h2>
                  <button
                    onClick={() => navigator.clipboard.writeText(subtitles)}
                    className="text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Copy to clipboard
                  </button>
                </div>
                <div className="w-full p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-300 leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                  {subtitles}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

