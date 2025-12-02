import fs from 'fs';

function main() {
  const path = "./dist/index.html";
  
  try {
    const data = fs.readFileSync(path, { encoding: "utf-8" });
    let final = data.split('src="./').join('src="');
    final = final.split('href="./').join('href="');
    fs.writeFileSync(path, final);
    console.log('✅ Paths transformed successfully in dist/index.html');
  } catch (err) {
    console.error('❌ Error transforming paths:', err);
  }
}

main();