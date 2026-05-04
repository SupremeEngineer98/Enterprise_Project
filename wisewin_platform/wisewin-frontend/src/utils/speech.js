// Text-to-speech helpers using the browser's built-in SpeechSynthesis API.
// Used to read quiz questions aloud for accessibility.

// Reads a piece of text aloud. Cancels any speech already in progress before starting.
export function speakText(text, lang = "en-US") {
  if (!("speechSynthesis" in window)) {
    alert("Text-to-speech is not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

// Stops whatever is currently being spoken
export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
