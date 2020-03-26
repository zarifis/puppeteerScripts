const puppeteer = require('puppeteer');
const { exec } = require("child_process");
const sleep = require('sleep-promise');


/*
piactl disconnect
piactl connect
piactl get vpnip
piactl set region <region>
*/

exec("piactl connect", (error, stdout, stderr) => {});

const regions = ["uk-london", "india", "new-zealand", "us-east"];

urls = ["https://www.google.com", "https://www.youtube.com"];

(async () => {

    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    var cnt = 1;

    for(let region of regions){
        exec("piactl set region "+region, (error, stdout, stderr) => {});
        await sleep(10000); // Wait 10 sec for region change
        exec("piactl get vpnip", (error, stdout, stderr) => {
            var ip = stdout.trim();
            console.log(`Current VIP is ${ip} (${region})`);
        });

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
                            fs.appendFile('NELadoption', hostname+" "+nel+" "+reportto+" "+region+"\n", (err) => {
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
    }
    
    await browser.close();

})();

exec("piactl disconnect", (error, stdout, stderr) => {});
