# TransNow

One voice. Every language.

## Demo

(live link / gif)

## Features

- Real-time speech recognition
- Instant translation
- Client-side speech synthesis

## ## Architecture & Real-Time Processing Details

TransNow captures your voice, translates it, and speaks it back in another language — all in near real-time. Here's how it works under the hood:

### Real-Time Streaming Mechanics

- **Capture:** Uses the browser’s Web Speech API to listen to a single utterance at a time. The browser handles streaming audio internally; we don’t manually buffer audio chunks.
- **Translation Transport:** Each spoken transcript is sent as a single HTTP POST request to our server for translation. No WebSockets or streaming — just one request per transcript.
- **Playback:** Translated text is converted to speech locally on the client. The audio plays once the translation is complete; there’s no progressive or streamed playback.

### Speech-to-Text Pipeline

- **Technology:** Browser Web Speech API (implementation may vary across browsers/OS). No fallback libraries are used.
- **Mode:** Non-continuous — captures a single utterance per session. Recognition starts on click, and only the first final transcript is returned.
- **Latency Drivers:** Delays mostly come from browser STT processing and waiting for the final transcript. Interim partial results are not captured, which increases perceived latency.

### Translation Layer

- **API:** Server-side translation uses the unofficial Google Translate API (`@vitalets/google-translate-api`).
- **Locale Handling:** BCP-47 language codes are split to determine base language (`language.split("-")[0]`).
- **Partial vs Final:** Only final transcripts are translated. No incremental or partial translations are supported yet. Each translation response is a single text string.

### Text-to-Speech Pipeline

- **Technology:** Browser `speechSynthesis`. Voices are enumerated and filtered by language.
- **Voice Selection:** Uses the voice that matches the selected language if available; otherwise, playback is skipped silently.
- **Streaming:** Audio is synthesized locally and played in one shot. Previous utterances are canceled before starting new speech.

### Latency Considerations

The main delay comes from:

1. Waiting for the final STT result.
2. Server-side translation API round-trip.
3. Local TTS synthesis startup and rendering.
4. Network round-trip between client and server.

Currently, translation and TTS only start **after** STT finishes, which limits overlap and adds latency.

### Error Handling & Recovery

- **STT:** Alerts users if Speech Recognition isn’t supported. No retries or continuous session recovery yet.
- **Translation API:** Only logs errors in the console. Client checks response status but doesn’t display errors in UI.
- **TTS:** If no matching voice exists, speech is skipped silently. No fallback or user feedback is implemented.

### Scalability

- **Server:** Stateless per request. Scales horizontally with multiple Node/Next.js instances. Bottlenecks can occur due to translation API rate limits.
- **Client:** Offloads STT and TTS to the browser, minimizing server load.
- **Concurrency:** No WebSockets or fan-out; each client independently sends translation requests.

### Design Trade-Offs & Future Improvements

- **Simplicity vs True Real-Time:** Using single-session STT and one-off translation keeps the code minimal but prevents streaming and overlapping pipelines. Future improvements could include continuous recognition with interim results, WebSocket streaming, and incremental TTS playback.
- **TTS Quality:** Browser voices are inconsistent. Using server-side TTS with streaming audio chunks could improve quality and consistency.
- **Translation Reliability:** Unofficial API may break or throttle. Moving to an official, authenticated API with batch support is recommended.
- **Latency Optimization:** Consider partial translations, speculative TTS, HTTP keep-alive, and deploying translation servers closer to users.
- **Error Handling:** Surface errors in the UI, implement retries/backoff, add voice fallback, and set timeouts.
- **UX Improvements:** Add voice activity detection, auto-stop, session state handling, and voice/language availability checks.
- **Observability:** Track STT latency, translation time, and playback start time. Capture user-agent to understand variability across devices.
- **Scalability:** Introduce rate limiting, caching, edge functions/CDN distribution, and streaming via managed WebSockets for high concurrency.

## Tech Stack

- Next.js
- Web Speech API
- Google Translate API
