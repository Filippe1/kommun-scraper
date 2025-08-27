# kommun-scraper
Scraper for nacka kommun nyheter on the website: https://www.nacka.se/nyheter-start/ 

first, download repo: 
```
git clone https://github.com/Filippe1/kommun-scraper.git
```

then install all packages if needed: 
```
npm install
```

run the following command in terminal to scrape the news articles: 
```
node scrape.js
```

the scraped content will appear in /output/ folder. To create an sqlite database from the json file you can run: 
```
node createdb.js
```

The database will appear in /db/ folder. 

# Other information

Scrapes only 5 most recent news articles, can be improved to scrape all of them. Formatting in database can be improved by eliminating lines. 


