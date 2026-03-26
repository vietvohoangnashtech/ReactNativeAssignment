const fs = require('fs');
let txt = fs.readFileSync('d:/Work/Learn/2025/ReactNativeAssignment/README.md', 'utf-8');

txt = txt.replace(/## \uFFFD\uFFFD\uFFFD Table of Contents/, '## Ì≥ã Table of Contents');
txt = txt.replace(/## \uFFFD\uFFFD\uFFFD Project Structure/, '## Ì≥Å Project Structure');
txt = txt.replace(/## \uFFFD\uFFFD\uFFFDÔ∏è Tech Stack/, '## Ìª†Ô∏è Tech Stack');
txt = txt.replace(/## \uFFFD\uFFFD\uFFFD Backend Setup/, '## Ì¥ß Backend Setup');
txt = txt.replace(/## \uFFFD\uFFFD\uFFFD Mobile Setup/, '## Ì≥± Mobile Setup');
txt = txt.replace(/## \uFFFD\uFFFD\uFFFD API Documentation/, '## Ì≥ñ API Documentation');
txt = txt.replace(/## \uFFFD\uFFFD\uFFFDÔ∏è Architecture/, '## ÌøóÔ∏è Architecture');
txt = txt.replace(/## \uFFFD\uFFFD\uFFFD Testing/, '## Ì∑™ Testing');
txt = txt.replace(/## \uFFFD\uFFFD\uFFFD Running the App/, '## Ì∫Ä Running the App');
txt = txt.replace(/## \uFFFD\uFFFD\uFFFD Submission/, '## Ì≥ù Submission');
txt = txt.replace(/## \uFFFD\uFFFD\uFFFD References/, '## Ì≥ö References');

fs.writeFileSync('d:/Work/Learn/2025/ReactNativeAssignment/README.md', txt, 'utf-8');
console.log("Emojis fixed.");
