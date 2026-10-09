import React, { useState } from 'react';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState('ur-to-en');

  // 1. مائیک (وائس انپٹ)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("آپ کے براؤزر میں وائس انپٹ کی سہولت موجود نہیں۔");
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
      translateText(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };
  };

  // 2. کیمرہ (OCR)
  const handleImageCapture = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('apikey', 'helloworld');
    formData.append('language', 'eng');

    try {
      const res = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const extracted = data?.ParsedResults?.[0]?.ParsedText || '';

      if (extracted) {
        setInputText(extracted);
        translateText(extracted);
      } else {
        alert("تصویر سے کوئی متن نہیں پڑھا جا سکا!");
      }
    } catch (err) {
      alert("OCR پروسیسنگ میں مسئلہ آیا!");
    } finally {
      setLoading(false);
    }
  };

  // 3. ترجمہ
  const translateText = async (textToTranslate) => {
    if (!textToTranslate) return;
    setLoading(true);
    const targetLang = mode === 'ur-to-en' ? 'en' : 'ur';
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`
      );
      const data = await res.json();
      const translation = data[0].map((item) => item[0]).join('');
      setTranslatedText(translation);
    } catch (err) {
      setTranslatedText('ترجمہ کرنے میں ناکامی ہوئی۔');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#007bff' }}>Boltranslate App</h1>

      {/* موڈ سلیکٹر */}
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={() => setMode('ur-to-en')}
          style={{ padding: '8px 15px', marginRight: '10px', backgroundColor: mode === 'ur-to-en' ? '#007bff' : '#ccc', color: '#fff', border: 'none', borderRadius: '5px' }}
        >
          اردو ➔ English
        </button>
        <button
          onClick={() => setMode('en-to-ur')}
          style={{ padding: '8px 15px', backgroundColor: mode === 'en-to-ur' ? '#007bff' : '#ccc', color: '#fff', border: 'none', borderRadius: '5px' }}
        >
          English ➔ اردو
        </button>
      </div>

      {/* کیمرہ اور مائیک کے بٹن */}
      <div style={{ margin: '15px 0' }}>
        <label style={{ padding: '10px 15px', backgroundColor: '#28a745', color: '#fff', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
          📷 کیمرہ
          <input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} style={{ display: 'none' }} />
        </label>

        <button onClick={startListening} style={{ padding: '10px 15px', backgroundColor: isListening ? '#dc3545' : '#17a2b8', color: '#fff', border: 'none', borderRadius: '5px' }}>
          {isListening ? 'سن رہا ہے...' : '🎙️ مائیک آن کریں'}
        </button>
      </div>

      {loading && <p>پروسیسنگ ہو رہی ہے...</p>}

      <textarea
        rows="4"
        style={{ width: '90%', padding: '10px', marginBottom: '10px' }}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="یہاں لکھیں یا مائیک/کیمرہ استعمال کریں..."
      />
      <br />
      <button 
        onClick={() => translateText(inputText)} 
        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}
      >
        ترجمہ کریں
      </button>

      {translatedText && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <strong>ترجمہ:</strong>
          <p>{translatedText}</p>
        </div>
      )}
    </div>
  );
}
