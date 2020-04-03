//Khai báo
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var getJSON = require('get-json');
var fs = require('fs');
var ms = require('ms');
const axios = require("axios");
const cheerio = require("cheerio");
const graphql = require("graphql-request");
//url link
const url = "https://corona-api.kompa.ai/graphql";
const arcgis_url = 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=1=1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Confirmed%20desc&outSR=102100&resultOffset=0&resultRe%20cordCount=160&cacheHint=true'
const worldometers_url = 'https://www.worldometers.info/coronavirus/'
const us_state_url = 'https://www.worldometers.info/coronavirus/country/us/'
const newsbreak_url = 'https://www.newsbreak.com/topics/coronavirus'
const jhu_csse_url = 'https://corona.lmao.ninja/jhucsse'
//config graphqlclient
const graphqlclient = new graphql.GraphQLClient(url, {
    headers: {
        Authority: "corona-api.kompa.ai",
        Scheme: "https",
        Path: "/graphql",
        Accept: "*/*",
        UserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36",
        Origin: "https://corona.kompa.ai",
        secfetchsize: "same-site",
        secfetchmode: "cors",
        Referer: "https://corona.kompa.ai",
        AcceptEncoding: "gzip, deflate, br",
        AcceptLanguage: "vn-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5"
    },
});
const query = `query provinces {
    provinces {
        Province_Name
        Province_Id
        Confirmed
        Deaths
        Recovered
        Last_Update
    }
}`;
const news_query = `query topTrueNews {
    topTrueNews {
        title
        url
        siteName
        picture
        }
}`

async function jhu() {
    getJSON(jhu_csse_url, function(error, response){
        if (error) return;
        fs.writeFileSync('./jhucsse.json', JSON.stringify(response))
        console.log('Đã ghi file jhucsse.json')
    })
}

async function worldometer(){
    let Countries = []
    const result = await axios.get(worldometers_url);
    let $ = cheerio.load(result.data);
    $('#main_table_countries_today').find('tbody').eq(0).find('tr').each((i, el) => {
        Countries.push($(el).find('td').eq(0).text().trim())
    })

    const json_response = []
    Countries.forEach(country => {
                let Index = Countries.indexOf(country) + 1
                json_response.push({
                            Country_Name: `${$(`#main_table_countries_today > tbody:nth-child(2) > tr:nth-child(${Index}) > td:nth-child(1)`).text().trim() || '0'}`,
    Total_Cases: `${$(`#main_table_countries_today > tbody:nth-child(2) > tr:nth-child(${Index}) > td:nth-child(2)`).text().trim() || '+0'}`,
    New_Cases: `${$(`#main_table_countries_today > tbody:nth-child(2) > tr:nth-child(${Index}) > td:nth-child(3)`).text().trim() || '0'}`,
    Total_Deaths: `${$(`#main_table_countries_today > tbody:nth-child(2) > tr:nth-child(${Index}) > td:nth-child(4)`).text().trim() || '0'}`,
    New_Deaths: `${$(`#main_table_countries_today > tbody:nth-child(2) > tr:nth-child(${Index}) > td:nth-child(5)`).text().trim() || '+0'}`,
    Total_Recovered: `${$(`#main_table_countries_today > tbody:nth-child(2) > tr:nth-child(${Index}) > td:nth-child(6)`).text().trim() || '0'}`,
    Serious_Cases: `${$(`#main_table_countries_today > tbody:nth-child(2) > tr:nth-child(${Index}) > td:nth-child(8)`).text().trim() || '0'}`
    })
})
    fs.writeFileSync('./worldometers.json',JSON.stringify(json_response))
    await console.log('Đã ghi file worldometers.json')
    // Total của worldometers
    var data = $('.maincounter-number').text().trim()
    var data = data.replace(/\s\s+/g, ' ').split(' ');
    let total_json = {
        Global_Cases: data[0],
        Global_Deaths: data[1],
        Global_Recovered: data[2]
    }
    fs.writeFileSync('./total.json', JSON.stringify(total_json))
    await console.log('Đã ghi file total.json')
}

async function arcgis(){
    //arcgis url
    getJSON(arcgis_url).then(async response => {
        if (response.error) {
            return console.log('Error!');
        } else {
            fs.writeFileSync('./arcgis.json', JSON.stringify(response))
            await console.log('Đã ghi file arcgis.json')
        }
    })
}

async function usstate(){
        //us state
        let US_STATE = []
        const usstateresult = await axios.get(us_state_url);
        let $state = cheerio.load(usstateresult.data);
        $state('#usa_table_countries_today').find('tbody').eq(0).find('tr').each((i, el) => {
            US_STATE.push($state(el).find('td').eq(0).text().trim())
        })
    
        let us_state_json = []
                US_STATE.forEach(state => {
                    let Index = US_STATE.indexOf(state) + 1
                    us_state_json.push({
                        State_Name: `${$state(`#usa_table_countries_today > tbody:nth-child(2) > tr:nth-child(${Index}) > td:nth-child(1)`).text().trim() || '0'}`,
        Total_Cases: `${$state(`#usa_table_countries_today > tbody:nth-child(2) > tr:nth-child(${Index}) > td:nth-child(2)`).text().trim() || '+0'}`,
        New_Cases: `${$state(`#usa_table_countries_today > tbody:nth-child(2) > tr:nth-child(${Index}) > td:nth-child(3)`).text().trim() || '0'}`,
        Total_Deaths: `${$state(`#usa_table_countries_today > tbody:nth-child(2) > tr:nth-child(${Index}) > td:nth-child(4)`).text().trim() || '0'}`,
        New_Deaths: `${$state(`#usa_table_countries_today > tbody:nth-child(2) > tr:nth-child(${Index}) > td:nth-child(5)`).text().trim() || '+0'}`,
        Total_Recovered: `N/A`
        })
        })
        //Total_Recovered: `${$state(`#usa_table_countries_today > tbody:nth-child(2) > tr:nth-child(${Index}) > td:nth-child(6)`).text().trim() || '0'}`
        fs.writeFileSync('./us.json', JSON.stringify(us_state_json))
        console.log('Đã ghi file us.json')
}
async function corona_kompa(){
    graphqlclient.request(query).then(result => { //province
        fs.writeFileSync('./kompa_province.json', JSON.stringify(result));
        console.log('Đã ghi file kompa_province.json')
    });
    graphqlclient.request(news_query).then(result => {
        fs.writeFileSync('./kompa_news.json', JSON.stringify(result));
        console.log('Đã ghi file kompa_news.json')
    })
}

function all(){ //function chạy nhanh (set cronjob 1 phút)
    worldometer();
    arcgis();
    corona_kompa();
    usstate();
    jhu();
    console.log('Đã ghi tất cả file.')
}

async function newsbreak() {
    console.time('newsbreak');
    let us_full_json = []
    const result = await axios.get(newsbreak_url)
    let $ = cheerio.load(result.data)
    var i_max =  $('.state-table').find('tbody').eq(0).find('span').length
    for (i = 1; i < i_max; i++){
    var confirmed_arr = $(`.state-table > tbody > tr:nth-child(${i}) > td:nth-child(2)`).text().trim().split('+')
    var death_arr = $(`.state-table > tbody > tr:nth-child(${i}) > td:nth-child(3)`).text().trim().split('+')
    var name = $(`.state-table > tbody > tr:nth-child(${i})`).find('span').text().trim()
    var confirmed = confirmed_arr[0];
    var new_confirmed = confirmed_arr[1] || 0;
    var deaths = death_arr[0];
    var new_deaths = death_arr[1] || 0;
    if (!name) continue;
    if (name.startsWith('▸')) continue;
    us_full_json.push({
        Province_Name: `${name}`,
        Confirmed: `${confirmed}`,
        New_Confirmed: `${new_confirmed}`,
        Deaths: `${deaths}`,
        New_Deaths: `${new_deaths}`
    })
    console.log(name)
    }
    fs.writeFileSync('./usprovince.json', JSON.stringify(us_full_json))
    console.log('Done writing data to usprovince.json')
    console.timeEnd('newsbreak')
}
//Set vòng lặp ở đây
setInterval(all, ms('3m')) //all gồm worldometer(), arcgis(), usstate() và coronakompa()
setInterval(newsbreak, ms('30m')) //news break (getdata avg time: 154823.547ms ~ 2.5 min)
//Set vòng lặp ở đây

var app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));
var server = http.createServer(app);

app.get('/jhudata', (req, res) => {
    res.send(JSON.parse(fs.readFileSync('./jhucsse.json')))
})
app.get('/arcgis', (req, res) => {
    res.send(JSON.parse(fs.readFileSync('./arcgis.json')))
})

app.get('/kompa', (req,res) => {
    if (req.query.data == 'news'){
        res.send(JSON.parse(fs.readFileSync('./kompa_news.json')))
    } else {
        res.send(JSON.parse(fs.readFileSync('./kompa_province.json')))
    }
})

app.get('/worldometers' ,(req, res) => {
    if (req.query.data == 'usstate'){
        res.send(JSON.parse(fs.readFileSync('./us.json')))
    } else if (req.query.data == 'total'){
        res.send(JSON.parse(fs.readFileSync('./total.json')))
    } else {
        res.send(JSON.parse(fs.readFileSync('./worldometers.json')))
    }
})

app.get('/breaknews' ,(req, res) => {
    res.send(JSON.parse(fs.readFileSync('./usprovince.json')))
})

app.get('/', (req, res) => {
    res.send("Home page. Server running okay.");
});

app.set('port', process.env.PORT || 5000);
app.set('ip', process.env.IP || "0.0.0.0");

server.listen(app.get('port'), app.get('ip'), function () {
    console.log("Corona-js is listening at %s:%d ", app.get('ip'), app.get('port'));
});