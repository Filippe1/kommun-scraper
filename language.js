const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('https://herbsaremyworld.com');
    
    // Click on the language switcher (if present)
    await page.click('.language-selector [lang="en"]'); 

    const content = await page.evaluate(() => document.body.innerText);
    console.log(content);
    
    await browser.close();
})();
