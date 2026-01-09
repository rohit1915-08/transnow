"use client";

import { useState, useEffect } from "react";
import { Mic, Volume2 } from "lucide-react";

const Translator = () => {
  const [text, setText] = useState<string>();
  const [translation, setTranslation] = useState<string>();
  const [language, setLanguage] = useState<string>("en-US");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) {
        setVoices(v);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const supportedLanguages = Array.from(new Set(voices.map((v) => v.lang)));

  function speak(text: string) {
    const voice = voices.find((v) => v.lang === language);
    if (!voice) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function handleOnRecord() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    setIsRecording(true);

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      setIsRecording(false);

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: transcript,
            language,
          }),
        });

        if (!response.ok) return;

        const data = await response.json();
        setTranslation(data.text);
        speak(data.text);
      } catch (err) {
        console.error(err);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.start();
  }

  const languageLabels: Record<string, string> = {
    "en-US": "English (United States)",
    "de-DE": "German (Germany)",
    "en-GB": "English (United Kingdom)",
    "es-ES": "Spanish (Spain)",
    "es-US": "Spanish (United States)",
    "fr-FR": "French (France)",
    "hi-IN": "Hindi (India)",
    "id-ID": "Indonesian (Indonesia)",
    "it-IT": "Italian (Italy)",
    "ja-JP": "Japanese (Japan)",
    "ko-KR": "Korean (South Korea)",
    "nl-NL": "Dutch (Netherlands)",
    "pl-PL": "Polish (Poland)",
    "pt-BR": "Portuguese (Brazil)",
    "ru-RU": "Russian (Russia)",
    "zh-CN": "Chinese (Simplified, China)",
    "zh-HK": "Chinese (Hong Kong)",
    "zh-TW": "Chinese (Traditional, Taiwan)",
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-neutral-300 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-4xl text-teal-600 font-bold ">
                TransNow :{" "}
                <span className=" text-2xl text-yellow-600">
                  Speak once and be understood in every language!!{" "}
                </span>
              </h1>
            </div>
          </div>

          <select
            className="px-4 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 text-sm focus:outline-none focus:border-teal-500 transition-colors"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {languageLabels[lang] || lang}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main
        className="flex-1 relative bg-cover bg-bottom bg-no-repeat "
        style={{ backgroundImage: "url('/bg_image.png')" }}
      >
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
          <div className="flex justify-center">
            <button
              onClick={handleOnRecord}
              disabled={isRecording}
              className={`group relative ${
                isRecording ? "scale-95" : "hover:scale-105"
              } transition-transform duration-200`}
            >
              <div className="flex flex-col items-center justify-center mt-10">
                <div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isRecording
                      ? "bg-red-500 border-red-500 shadow-lg shadow-red-500/30"
                      : "bg-linear-to-br from-teal-500 to-orange-500 border-teal-500 hover:shadow-xl hover:shadow-teal-500/20"
                  }`}
                >
                  <Mic className="w-5 h-5 text-white" />
                </div>

                <p className="mt-3 text-center text-neutral-700 text-sm">
                  {isRecording ? "Listening..." : "Click to start recording"}
                </p>
              </div>

              {isRecording && (
                <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75" />
              )}
            </button>
          </div>

          <div>
            <h2 className="text-center text-neutral-600 mt-4">{}</h2>
          </div>

          {/* Translation panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Transcription */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className="w-4 h-4 text-teal-600" />
                <h2 className="text-sm uppercase tracking-wider text-neutral-700 font-medium">
                  Original
                </h2>
              </div>

              <div className="bg-white/80 border border-neutral-200 rounded-2xl p-6 min-h-60 shadow-lg">
                {text ? (
                  <p className=" text-neutral-900 leading-relaxed text-2xl">
                    {text}
                  </p>
                ) : (
                  <p className="text-neutral-400 text-center mt-20">
                    Your spoken text will appear here bhai
                  </p>
                )}
              </div>
            </div>

            {/* Translation */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm uppercase tracking-wider text-neutral-700 font-medium">
                  Translation
                </h2>
              </div>

              <div className="bg-white/80 border border-neutral-200 rounded-2xl p-6 min-h-60 shadow-lg">
                {translation ? (
                  <p className="text-2xl text-black leading-relaxed">
                    {translation}
                  </p>
                ) : (
                  <p className="text-neutral-400 text-center mt-20">
                    Translation will appear here
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Translator;
