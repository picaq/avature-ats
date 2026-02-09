import fs from 'fs';

const content = fs.readFileSync('./input_file.txt', 'utf8');
const input_file = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

console.log(input_file);

const set = new Set(input_file);
console.log(set.size);

const output = Array.from(set).join('\n');
fs.writeFileSync('input_file_unique.txt', output, 'utf8');

console.log(`Wrote ${set.size} items to input_file_unique.txt`);
