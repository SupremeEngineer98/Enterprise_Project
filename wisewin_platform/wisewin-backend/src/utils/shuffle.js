// Randomises the order of an array using the Fisher-Yates algorithm.
// Used when serving quiz questions so the answer options appear in a different order each time.
export function shuffleArray(array) {
  const arr = [...array]; // work on a copy so we don't change the original

  // Walk backwards through the array and swap each element with a random earlier one
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}
