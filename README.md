# Rumblebros Shopify Theme
This is the custom District theme for our Shopify store rumblebrothers.com.  
I do all theme development using {Shopify's}[https://github.com/Shopify/] [Slate]{https://github.com/Shopify/slate/}
## I've implemented a few custom features into this theme.
1. Vehicle picker
    - Pulls years, makes, models from assets/models.json
    - Shows selection option right under main navigation
    - If a vehilce is selected, it will refresh any shopify collection that is related to car parts to match the current vehicle selected
    - Each producted is tagged with appropriate year_, make_, model_, and trim_ tags as that's how Shopify sorts collections
    - Confirms vehicle fitment on the product's page
    
All of my custom features reside in src/layout/theme.liquid, src/assets/theme.scss.liquid, src/assets/bc-sf-filter.js, src/snippets/product-grid-item.liquid, and src/snippets/product-list-item.liquid.  
Most of what I've done is small, I have made comments where my custom code starts and ends in each file.
## I've also made a few custom backend API apps using Python (soon to be Ruby/Ruby on Rails)
1. Auto update inventories from manufacturers
2. Auto update prices from manufacturers
## We also use the following Shopify apps:
1. Bespoke Shipping  
   _I've customized this app A LOT with their PHP scripts. I'll upload this to a separate repo in the future as it could be helpful. Their example scripts aren't that great_  
2. Product Discounts
3. Kit
4. Product Filter & Search  
    _I've also customized this app as from default the "on sale" label is just a boring label that says "ON SALE". I wanted it to say the % off... so I did just that._
5. Product Reviews
6. SEO Image Optimizer by Booster Apps