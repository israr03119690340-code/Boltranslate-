import React, { useState } from 'react';

function App() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('ur-to-en');

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("آپ کے براؤزر میں وائس ان پٹ کی سہولت نہیں ہے، براہ کرم Chrome استعمال کریں۔");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = mode === 'ur-to-en' ? 'ur-PK' : 'en-US';
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
      handleTranslate(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handleTranslate = async (textToTranslate = inputText) => {
    if (!textToTranslate.trim()) return;
    setLoading(true);

    const langPair = mode === 'ur-to-en' ? 'ur|en' : 'en|ur';
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${langPair}`
      );
      const data = await response.json();
      const result = data.responseData.translatedText;
      setTranslatedText(result);
      speakText(result, mode === 'ur-to-en' ? 'en-US' : 'ur-PK');
    } catch (error) {
      console.error("ترجمے میں مسئلہ آیا:", error);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text, lang) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center' }}>AI Boltranslate App</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <button 
          onClick={() => setMode('ur-to-en')}
          style={{ padding: '10px', backgroundColor: mode === 'ur-to-en' ? '#007bff' : '#ccc', color: 'white', border: 'none', borderRadius: '5px' }}>
          اردو ➔ English
        </button>
        <button 
          onClick={() => setMode('en-to-ur')}
          style={{ padding: '10px', backgroundColor: mode === 'en-to-ur' ? '#007bff' : '#ccc', color: 'white', border: 'none', borderRadius: '5px' }}>
          English ➔ اردو
        </button>
      </div>

      <textarea
        rows="4"
        style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px' }}
        placeholder={mode === 'ur-to-en' ? "اردو بولیں یا لکھیں..." : "Type or speak English..."}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button 
          onClick={startListening}
          style={{ flex: 1, padding: '12px', backgroundColor: isListening ? '#dc3545' : '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
          {isListening ? 'سُن رہا ہے...' : '🎤 مائیک آن کریں'}
        </button>
        <button 
          onClick={() => handleTranslate()}
          style={{ flex: 1, padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
          {loading ? 'ترجمہ ہو رہا ہے...' : 'ترجمہ کریں'}
        </button>
      </div>

      {translatedText && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderLeft: '5px solid #007bff', borderRadius: '5px' }}>
          <h4>ترجمہ:</h4>
          <p style={{ fontSize: '18px' }}>{translatedText}</p>
          <button 
            onClick={() => speakText(translatedText, mode === 'ur-to-en' ? 'en-US' : 'ur-PK')}
            style={{ padding: '5px 10px', cursor: 'pointer' }}>
            🔊 دوبارہ سنیں
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
