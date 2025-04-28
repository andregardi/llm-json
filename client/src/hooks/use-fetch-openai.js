import { useState } from 'react';

export const useFetchOpenAI = () => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchOpenAI = async (prompt, currentFamilyData) => {
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, familyData: currentFamilyData }),
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Error making API call:', error);
      setResponse('Error: Failed to fetch response from API');
    } finally {
      setLoading(false);
    }
  };

  return { response, loading, fetchOpenAI };
}
