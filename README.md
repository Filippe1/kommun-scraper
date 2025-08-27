# kommun-scraper
Scraper for Nacka kommun nyheter on the website: https://www.nacka.se/nyheter-start/ 

I used javascript for scraping and stored output in JSON format as it is widely used and human-readable. I aslo added script to 
create and populate local sqlite database since it is easy to access and manage locally. This set up was chosen since it is easy to check the json file for errors and to rescrape without affecting the sqlite database. The data can then be analysed by LLM or other methods. 

first, download repo: 
```
git clone https://github.com/Filippe1/kommun-scraper.git
```

then install all packages if needed: 
```
npm install
```

For best results, you can delete files in /db/ and /output/ folder to ensure new files are created when running the below commands.


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


