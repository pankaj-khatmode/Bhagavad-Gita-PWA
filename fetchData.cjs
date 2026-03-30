const fs = require('fs');
const path = require('path');

const verseCounts = [47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78];

async function fetchGita() {
  console.log("Starting to fetch all 700 shlokas...");
  const allShlokas = [];
  
  for (let ch = 1; ch <= 18; ch++) {
    const totalVerses = verseCounts[ch - 1];
    console.log(`Fetching Chapter ${ch} (${totalVerses} shlokas)...`);
    
    const chapterPromises = [];
    for (let sl = 1; sl <= totalVerses; sl++) {
        // We fetch from the vedicscriptures API
        const p = fetch(`https://vedicscriptures.github.io/slok/${ch}/${sl}`)
            .then(r => r.json())
            .then(data => {
                return {
                    id: `${ch}-${sl}`,
                    chapter: ch,
                    shlok: sl,
                    sanskrit: data.slok || "N/A",
                    transliteration: data.transliteration || "",
                    // Use Tejomayananda's Hindi translation as Marathi baseline if not found
                    marathiMeaning: (data.tej && data.tej.ht) || (data.rams && data.rams.ht) || "Meaning not available",
                    // Sivananda's English Translation
                    englishMeaning: (data.siva && data.siva.et) || (data.gambir && data.gambir.et) || (data.prabhu && data.prabhu.et) || "Translation not available",
                    marathiExplanation: (data.chinmay && data.chinmay.hc) || (data.rams && data.rams.hc) || "Explanation not available",
                    englishExplanation: (data.siva && data.siva.ec) || (data.prabhu && data.prabhu.ec) || "Explanation not available",
                    // Keep a generic example
                    example: "Consider how performing one's duty selflessly applies to everyday responsibilities.",
                    // Construct an open-source audio endpoint mapping
                    audioFile: `https://github.com/gita/gita/raw/master/data/audio/${ch}_${sl}.mp3`
                };
            })
            .catch(err => {
                console.error(`Failed to fetch ${ch}-${sl}:`, err);
                return null;
            });
        chapterPromises.push(p);
    }
    
    // Concurrently fetch the chapter
    const results = await Promise.all(chapterPromises);
    allShlokas.push(...results.filter(r => r !== null));
  }
  
  // Save to src/data/shloks.json
  const outPath = path.join(__dirname, 'src', 'data', 'shloks.json');
  fs.writeFileSync(outPath, JSON.stringify(allShlokas, null, 2));
  console.log(`Successfully saved ${allShlokas.length} shlokas to src/data/shloks.json`);
}

fetchGita();
