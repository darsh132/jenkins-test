import SpellChecker from "react-spellchecker";

/**
 * Checks and highlights misspelled words.
 * @param {string} text - Input text
 * @returns {string} - Text with incorrect words highlighted
 */
export const spellCheck = (text) => {
  return text
    .split(/\s+/)
    .map((word) => (SpellChecker.isMisspelled(word) ? `*${word}*` : word))
    .join(" ");
};

/**
 * Provides spelling suggestions.
 * @param {string} word - Word to check
 * @returns {string[]} - Suggested words
 */
export const getSuggestions = (word) => {
  return SpellChecker.getSuggestions(word);
};
