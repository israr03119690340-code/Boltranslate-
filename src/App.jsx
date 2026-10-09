import React, { useState } from 'react';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);

  const translateText = async (textToTranslate) => {
    if (!textToTranslate) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ur&dt=t&q=${encodeURIComponent(textToTranslate)}`
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
      <p style={{ color: '#28a745', fontWeight: 'bold' }}>ایپ کام کر رہی ہے!</p>

      <textarea
        rows="4"
        style={{ width: '90%', padding: '10px', marginBottom: '10px' }}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="یہاں متن لکھیں..."
      />
      <br />
      <button 
        onClick={() => translateText(inputText)} 
        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}
      >
        {loading ? 'ترجمہ ہو رہا ہے...' : 'ترجمہ کریں'}
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
