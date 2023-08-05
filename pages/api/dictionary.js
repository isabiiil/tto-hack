// utils/merriamWebsterAPI.js
const API_KEY = 'f2b8ef53-2496-4d42-89f3-8377ecd80d6d';
const BASE_URL = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/';

export async function getWordSyllables(word) {
  try {
    const response = await fetch(`${BASE_URL}${encodeURIComponent(word)}?key=${API_KEY}`);
    const data = await response.json();
    console.log(data);
    if (Array.isArray(data) && data.length > 0) {
      const firstEntry = data[0]; // currently defaults to the first entry
      // TODO: choose which entry to use based on the part of speech
      // TODO: also doesn't include words like shall 
      if (firstEntry.hwi && firstEntry.hwi.hw) {
        return firstEntry.hwi.hw.split('-');
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching syllables:', error);
    return null;
  }
}