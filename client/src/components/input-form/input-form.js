import { useState, useEffect, useRef } from "react";
import "./input-form.css";

export const InputForm = ({ loading, fetchOpenAI, familyData }) => {
  const [prompt, setPrompt] = useState('');
  const inputRef = useRef(null);
  
  useEffect(() => {
    if (!loading) {
      setPrompt('');
      inputRef.current?.focus();
    }
  }, [loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      fetchOpenAI(prompt, familyData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <div className="input-form-header">
        <h2 className="input-form-title">Describe your family</h2>
      </div>
      <div className="input-form-content">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: John is Mary's father. Lucy is John's wife..."
          ref={inputRef}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !prompt.trim()}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </form>
  );
};