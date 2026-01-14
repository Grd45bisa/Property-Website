
const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', 'Website360', 'Web-property', 'src', 'pages', 'TourPage.tsx');
let fileContent = fs.readFileSync(filePath, 'utf8');
let lines = fileContent.split(/\r?\n/);

// Helper to remove line at 1-based index
function removeLine(lineNumber) {
    if (lineNumber < 1 || lineNumber > lines.length) return;
    console.log(`Removing line ${lineNumber}: ${lines[lineNumber - 1]}`);
    lines.splice(lineNumber - 1, 1);
}

// Helper to remove range (inclusive, 1-based)
function removeRange(start, end) {
    if (start > end) return;
    console.log(`Removing lines ${start}-${end}`);
    console.log(`Start Content: ${lines[start - 1]}`);
    console.log(`End Content: ${lines[end - 1]}`);
    // Splice starts at index, delete count
    lines.splice(start - 1, end - start + 1);
}

// Execute removals in REVERSE order to maintain indices

// Conflict 2: Bottom Controls (884, 916, 926)
// Remove 926 (>>>>>>>)
removeLine(926);
// Remove 916 (=======)
removeLine(916);
// Remove 884 (<<<<<<< HEAD)
removeLine(884);

// Conflict 1: Hotspots (234, 330, 367)
// Remove 330-367 (Separator and Remote Content)
// Note: 330 is =======, 367 is >>>>>>>
removeRange(330, 367);

// Remove 234 (<<<<<<< HEAD)
removeLine(234);


const newContent = lines.join('\n');
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully updated TourPage.tsx');
