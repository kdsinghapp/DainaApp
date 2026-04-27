const fs = require('fs');

const content = fs.readFileSync('/Users/technorizen/Desktop/aman/DainaApp/src/localization/Localization.js', 'utf8');

const enMatch = content.match(/en: \{([\s\S]*?)\},/);
const mnMatch = content.match(/mn: \{([\s\S]*?)\},/);

if (!enMatch || !mnMatch) {
    console.log('Could not find en or mn objects');
    process.exit(1);
}

function getKeys(str) {
    const keys = [];
    const lines = str.split('\n');
    lines.forEach(line => {
        const match = line.match(/^\s*(\w+):/);
        if (match) {
            keys.push(match[1]);
        }
    });
    return keys;
}

const enKeys = getKeys(enMatch[1]);
const mnKeys = getKeys(mnMatch[1]);

console.log('EN Keys Count:', enKeys.length);
console.log('MN Keys Count:', mnKeys.length);

const missingInMn = enKeys.filter(k => !mnKeys.includes(k));
const missingInEn = mnKeys.filter(k => !enKeys.includes(k));

console.log('\nMissing in MN:', missingInMn);
console.log('\nMissing in EN:', missingInEn);
