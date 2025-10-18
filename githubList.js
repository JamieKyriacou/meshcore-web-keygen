import fetch from 'node-fetch';

const URL = 'https://raw.githubusercontent.com/nswmesh/nswmesh_wiki/refs/heads/main/docs/meshcore/repeater_list.md'

async function readTable() {
  const res = await fetch(URL);   
  if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
  const markdown = await res.text();

  // Extract table from MD
  const lines = markdown.split('\n').filter((line) => line.trim().startsWith('|') && line.includes('|'))

  const all = [];

  for (let line of lines) {
    let lineContents = line.split('|');
    lineContents = lineContents.reduce((a,b) => { return a.length > b.length ? a : b; });
    lineContents = lineContents.trim();
    all.push(lineContents);
  }

  return all;
}

// Extract prefixes (first 2 chars) from public keys
async function getRepeaterPrefixes() {
  const keys = await readTable();
  const prefixes = new Array();
  
  keys.forEach(key => {
    // Skip header rows
    if (key.length >= 2 && key !== 'public_key_prefix' && !key.includes('-')) {
      const prefix = key.substring(0, 2).toUpperCase();
      prefixes.push(prefix);
    }
  });
  
  return prefixes.sort();
}

// Export for use in browser (via script tag or module)
if (typeof window !== 'undefined') {
  window.getRepeaterPrefixes = getRepeaterPrefixes;
}

// Test when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const lines = await readTable();
    console.log('All keys:', lines);
    console.log('\nRepeater prefixes:', await getRepeaterPrefixes());
  })();
}

// Export for Node.js
export { readTable, getRepeaterPrefixes };