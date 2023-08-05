import React, { useState } from 'react';
import { getWordSyllables } from './api/dictionary';

export default function Home() {
  const [words, setWords] = useState('');
  const [results, setResults] = useState([]);
  const [syllableCount, setSyllableCount] = useState(0);
  const [userError, setUserError] = useState([]);

  const handleSearch = async () => {
    // Split the user input by spaces to get an array of words and trim whitespace
    const wordArray = words.split(' ').map((word) => word.trim());
    let totalSyllables = 0;
    console.log(wordArray);
    console.log(wordArray.length);

    // Fetch syllables for each word in the array
    const newResults = await Promise.all(
      wordArray.map(async (word) => {
        const syllablesData = await getWordSyllables(word); // API call to get syllables

        if (syllablesData) {
          // If the word is found in the Merriam-Webster API, count the syllables
          console.log(syllablesData);
          syllablesData.forEach((syllable) => {
            const syllableArray = syllable.split('*');
          totalSyllables += syllableArray.length;
          setSyllableCount(totalSyllables);
          });
        } else {
          // If the word is not found in the Merriam-Webster API, try to estimate syllables.
          // This is a simple estimation based on the number of vowels.
          const vowels = word.match(/[aeiouy]+/gi);
          totalSyllables += vowels ? vowels.length : 0;
          console.log('estimated')
        }
        return { word, syllables: syllablesData }; // Return an object with the word and how many syllables each word has
      })
    );

    // Check if the syllables match the iambic pentameter pattern
    const combinedSyllables = newResults.map((result) => result.syllables).flat();
    const iambicPentameterPattern = hasIambicPentameterPattern(combinedSyllables);

    console.log(totalSyllables);
    // Update the results with the new data
    setResults(newResults.map((result) => ({ ...result, isIambicPentameter: iambicPentameterPattern })));
  };

  // Check if the syllables match the iambic pentameter pattern
  const hasIambicPentameterPattern = (syllables) => {
    // if there are no syllables or it's less than two syllables, it can't be iambic pentameter
    if (!syllables || syllables.length < 2) return false;


    for (let i = 1; i < syllables.length; i += 2) {
      // const isStressed = syllables[i].match(/[\u02C8\u02CC]/gi);
      const isStressed = true;
      if (!isStressed) return false;
    }

    return true;
  };

  const renderSyllablesWithStress = (syllables) => {
    if (!syllables) return null;

    const syllablesWithStress = syllables.map((syllable, index) => {
      const isStressed = index % 2 === 1;
      return isStressed ? <b key={syllable}>{syllable}</b> : syllable;
    });

    return <p>Syllabication: {syllablesWithStress.join('-')}</p>;
  };

  return (
    <div>
      <input 
        type="text" 
        value={words} 
        onChange={(e) => setWords(e.target.value)} 
        className='text-green-500'
      />
      <button onClick={handleSearch}>Search</button>

      {results.map((result, index) => (
        <div key={index}>
          <h3>{result.word}</h3>
          {result.syllables ? (
            <div>
              {renderSyllablesWithStress(result.syllables)}
              <p>Iambic Pentameter Pattern: {result.isIambicPentameter ? 'true' : 'false'}</p>
            </div>
          ) : (
            <p>No syllabication found for this word.</p>
          )}
        </div>
      ))}
      {syllableCount !== null && (
        <p>
          {`The input has ${syllableCount} syllables. It is ${syllableCount === 10 ? 'exactly' : 'not'} ten syllables.`}
        </p>
      )}
    </div>
  );
}