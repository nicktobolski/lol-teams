export function intersectionOfArrays(...arrays: string[][]): string[] {
  // Check if there are no arrays or any one of the arrays is empty
  if (arrays.length === 0 || arrays.some((arr) => arr.length === 0)) {
    return [];
  }

  // Take the first array as the base for comparison
  const firstArray = arrays[0];

  // Filter the first array to include only those elements
  // that are present in every other array
  return firstArray.filter((item) => arrays.every((arr) => arr.includes(item)));
}
