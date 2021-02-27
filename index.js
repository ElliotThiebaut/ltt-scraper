const $ = require('cheerio');
const puppeteer = require('puppeteer');
const axios = require('axios');

const url = 'https://www.lttstore.com/products/deskpad';

const runCheckStock = () => {
    puppeteer
        .launch()
        .then((browser) => {
            return browser.newPage();
        })
        .then((page) => {
            return page.goto(url).then(() => {
                return page.content();
            });
        })
        .then((html) => {
            
            const butttonsText = $('button', html).text();
            const productName = $('h1', html).text();
            let oldStockStatus = false;
            let oldUrl = "";
            let currentStockStatus = false;

            axios.get('http://localhost:5000/lttstock')
                .then(response => {
                    oldStockStatus = response.data.hasStock;
                    oldUrl = response.data.url;
                })
                .catch(error => {
                    console.error(error);
                });
            
            
            if (butttonsText.includes("Sold Out")) {
                //If no stock but DB thinks there is stock
                currentStockStatus = false;
                console.log('No more stock');
            } else if (butttonsText.includes("Add to cart") && !oldStockStatus) {
                //If stock but DB thinks there is no stock
                currentStockStatus = true;
                console.log('Go buy !');
            }

            if ((oldUrl != url) || (currentStockStatus != oldStockStatus)) {
                axios.put('http://localhost:5000/lttstock', {
                    'stockStatus': currentStockStatus,
                    'name': productName,
                    'url': url
                });
            }
            
        })
        .catch((err) => {
            console.error(err);
        });
}

//setInterval(runCheckStock, 20000);
runCheckStock();

