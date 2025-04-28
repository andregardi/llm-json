import { useEffect, useState } from 'react';
import './App.css';
import { useFetchOpenAI } from '../../hooks/use-fetch-openai';
import { InputForm } from '../input-form/input-form';
import { FamilyTree } from '../family-tree/family-tree';

function App() {
  const { response, loading, fetchOpenAI } = useFetchOpenAI();
  const [familyData, setFamilyData] = useState([]);

  useEffect(() => {
    if (response) {
      try {
        const parsedData = JSON.parse(response);
        setFamilyData(parsedData);
      } catch (error) {
        console.error("Error parsing response:", error);
        setFamilyData([]);
      }
    }
  }, [response]);

  return (
    <div className="App">
      <div className="app-content">
        <InputForm loading={loading} familyData={familyData} fetchOpenAI={fetchOpenAI} />
        <FamilyTree familyData={familyData} loading={loading} />
      </div>
    </div>
  );
}

export default App;
