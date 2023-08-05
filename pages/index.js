import React, { useState } from 'react';
import { getWordSyllables } from './api/dictionary';

export default function Home() {
  const [words, setWords] = useState('');
  const [results, setResults] = useState([]);
  const [syllableCount, setSyllableCount] = useState(0);

  const [userError, setUserError] = useState([0]);
  const errorList = {
    1: 'Your query was empty. Begin a sonnet by entering a line.',
    2: 'There weren\'t enough syllables. Each line must have exactly ten syllables.',
    3: 'There were too many syllables. Each line must have exactly ten syllables.',
    4: 'The stressed and unstressed syllables are not alternating correctly. An iambic foot (pair of syllables) must go from unstressed to stressed.',
    5: 'There are an odd number of lines. Each iambic pentameter must be two lines of ten syllables each.',
    6: 'The last words of each line do not rhyme.'
  };
  let errorObject = {};
  

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

    // Check for errors
    if (!words) { // empty query
      setUserError([...userError, 1]); // TODO: these don't toggle off when the user enters a valid query
    } else if (totalSyllables < 10) { // not enough syllables
      setUserError([...userError, 2]);
    } else if (totalSyllables > 10) { // too many syllables
      setUserError([...userError, 3]);
      // } else if (!iambicPentameterPattern) { // not iambic pentameter
      //   setUserError([...userError, 4]);
    }
    

    // Update the results with the new data
    setResults(newResults.map((result) => ({ ...result, isIambicPentameter: iambicPentameterPattern })));
  };

  // create an object with the error messages
  errorObject = Object.fromEntries(
    Object.entries(errorList).filter(([key, value]) => userError.includes(Number(key)))
  );

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
  console.log(errorObject)

  return (
    <div>
      <div id='header'>
        <h1 className='text-center text-4xl py-8 font-bold'>Iambic Pentameter Checker</h1>
        <p className='text-center text-2xl'>Enter lines of text to check if it is in iambic pentameter.</p>
      </div>
      <div className='flex justify-center py-8'>
        <input 
          type="text" 
          value={words} 
          onChange={(e) => setWords(e.target.value)} 
          className='text-green-500 py-2 px-4 m-4 w-96 rounded'
        />
        <button 
          onClick={handleSearch}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold px-8 rounded'
        >Check</button>
      </div>
      <div className='flex justify-center'>
        <p>Here are the rules for Shakespearean sonnets:</p>
        <ul className="list-decimal list-outside ml-8 space-y-2">
          {userError.map((id) => (
            <li
              key={id}
              className="flex items-center space-x-2 cursor-pointer"
              // onClick={() => handleToggleItem(item.id)}
            >
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-indigo-600 pointer-events-none"
                // checked={key.checked}
                readOnly
              />
              <span>{errorObject[id]}</span>
            </li>
          ))}
        </ul>
        <p className='text-red-500'>{userError}</p>
      </div>
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