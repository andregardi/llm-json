import { useState, useEffect, useRef } from "react";

export const InputForm = ({ loading, fetchOpenAI, familyData }) => {
  const [prompt, setPrompt] = useState('');
  const inputRef = useRef(prompt);
  useEffect(() => {
    if (!loading) {
      setPrompt('');
      inputRef.current.focus();
    }
  }, [loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchOpenAI(prompt, familyData);
  };

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your prompt here..."
        ref={inputRef}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
};