import React, { useState } from 'react';
import { getWordSyllables } from './api/dictionary';

export default function Home() {
  const [words, setWords] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const wordArray = words.split(' ').map((word) => word.trim());
    const newResults = await Promise.all(
      wordArray.map(async (word) => {
        const syllablesData = await getWordSyllables(word);
        return { word, syllables: syllablesData };
      })
    );
    setResults(newResults);
  };

  const hasIambicPentameterPattern = (syllables) => {
    if (!syllables || syllables.length < 2) return false;

    for (let i = 1; i < syllables.length; i += 2) {
      const isStressed = syllables[i].match(/[\u02C8\u02CC]/gi); // NOT IT
      if (!isStressed) return false;
    }

    return true;
  };

  const renderSyllablesWithStress = (word, syllables) => {
    if (!syllables) return word;

    const syllablesWithStress = syllables.map((syllable, index) => {
      const isStressed = index % 2 === 1;
      return isStressed ? <b key={syllable}>{syllable}</b> : syllable;
    });

    const iambicPentameterPattern = hasIambicPentameterPattern(syllables);

    return (
      <div>
        <p>
          Syllabication: {syllablesWithStress.join('-')}
        </p>
        <p>
          Iambic Pentameter Pattern: {iambicPentameterPattern.toString()}
        </p>
      </div>
    );
  };

  return (
    <div>
      <input type="text" value={words} onChange={(e) => setWords(e.target.value)} />
      <button onClick={handleSearch}>Search</button>

      {results.map((result, index) => (
        <div key={index}>
          <h3>{result.word}</h3>
          {result.syllables ? (
            renderSyllablesWithStress(result.word, result.syllables)
          ) : (
            <p>No syllabication found for this word.</p>
          )}
        </div>
      ))}
    </div>
  );
}