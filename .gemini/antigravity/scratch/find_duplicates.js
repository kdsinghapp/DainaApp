const fs = require('fs');

const content = fs.readFileSync('/Users/technorizen/Desktop/aman/DainaApp/src/localization/Localization.js', 'utf8');

const enMatch = content.match(/en: \{([\s\S]*?)\},/);
const mnMatch = content.match(/mn: \{([\s\S]*?)\},/);

function getKeysWithDuplicates(str) {
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

const enKeys = getKeysWithDuplicates(enMatch[1]);
const mnKeys = getKeysWithDuplicates(mnMatch[1]);

function findDuplicates(arr) {
    const counts = {};
    const dups = [];
    arr.forEach(k => {
        counts[k] = (counts[k] || 0) + 1;
        if (counts[k] === 2) dups.push(k);
    });
    return dups;
}

console.log('EN Duplicates:', findDuplicates(enKeys));
console.log('MN Duplicates:', findDuplicates(mnKeys));

const uniqueEn = [...new Set(enKeys)];
const uniqueMn = [...new Set(mnKeys)];

const missingInMn = uniqueEn.filter(k => !uniqueMn.includes(k));
const missingInEn = uniqueMn.filter(k => !uniqueEn.includes(k));

console.log('Missing in MN:', missingInMn);
console.log('Missing in EN:', missingInEn);
