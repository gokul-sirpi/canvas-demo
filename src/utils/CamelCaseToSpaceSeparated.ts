export function camelCaseToSpaceSeparated(input: string): string {
  // Replace capital letters with a space before them, and convert the entire string to lowercase
  const spacedString = input.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  // Capitalize the first letter of the result
  return spacedString.charAt(0).toUpperCase() + spacedString.slice(1);
}

// Example usage
//   const result = camelCaseToSpaceSeparated('thisIsCamelCase');
//   console.log(result); // Output: "This is camel case"
