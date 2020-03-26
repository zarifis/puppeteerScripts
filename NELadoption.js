const puppeteer = require('puppeteer');
const fs = require('fs');

const flags = require('minimist')(process.argv.slice(2));
const inputFile = flags['in'];
const topN = parseInt(flags['topN']);

var urls = fs.readFileSync(inputFile).toString().toString().split("\n");
urls.pop();

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  var cnt = 1;

  for(let url of urls){
    console.log(cnt, url);
    cnt = cnt+1;
    try{
        var NELPolicies = {};
        page.on('response', response => {
            var headers = response.headers();
            if ('nel' in headers || "NEL" in headers) {
                var nel;
                var reportto;
                if ('nel' in headers) {
                    nel = headers['nel'];
                }
                else{
                    nel = headers['NEL'];
                }
                reportto = headers['report-to'];
                var hostname = new URL(response.url()).hostname;
                if (!(hostname in NELPolicies)){
                    NELPolicies[hostname] = true;
                    fs.appendFile('NELadoption', hostname+" "+nel+" "+reportto+"\n", (err) => {
                        if (err) throw err;
                    });
                }
            }
	});
	
        const response = await page.goto(url, {waitUntil:'domcontentloaded'});
    }
    catch (err){
       console.log('Ignored');
    }
  }

  await browser.close();
})();
