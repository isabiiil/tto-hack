// utils/merriamWebsterAPI.js
const API_KEY = 'f2b8ef53-2496-4d42-89f3-8377ecd80d6d';
const BASE_URL = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/';

export async function getWordSyllables(word) {
  try {
    const response = await fetch(`${BASE_URL}${encodeURIComponent(word)}?key=${API_KEY}`);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const firstEntry = data[0];
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
