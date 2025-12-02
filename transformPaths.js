import fs from 'fs';

function main(){
    const path = "./dist/index.html"
    try {
        const data = fs.readFileSync(path, {encoding: "utf-8"})
        let final = data.split('src="./').join('src="')
        final = final.split('href="./').join('href="')
        fs.writeFileSync(path, final);
    } catch (err) {
    }
}

main()