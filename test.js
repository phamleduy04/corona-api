const axios = require("axios");
const cheerio = require("cheerio");

async function main(){
    const boyte = await axios.get('https://ncov.moh.gov.vn/')
    let $ = cheerio.load(boyte.data);
    
}
main();