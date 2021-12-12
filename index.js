// Requirements
const fs = require("fs");
const url = require("url");
const http = require("http");
const slugify = require("slugify");

/////////////////////////////////////////////
// Functions
/**
 * Fills a template in with data about the provided beer, if the data exists. Does not supply award data to the template.
 * @param {String} template - HTML template to be filled in.
 * @param {Object} beer - Beer object with information that will be placed into template.
 * @returns {String} - Filled template.
 */
const fillInBeerData = function (template, beer) {
  let output = template
    .replace(/{%ID%}/g, slugifyBeerName(beer))
    .replace(/{%NAME%}/g, beer?.name)
    .replace(/{%STYLE%}/g, beer?.style)
    .replace(/{%ABV%}/g, beer?.abv)
    .replace(/{%IBU%}/g, beer?.ibu)
    .replace(/{%COLOR%}/g, beer?.color)
    .replace(/{%HEADCOLOR%}/g, beer?.headColor)
    .replace(/{%DESCRIPTION%}/g, beer?.description)
    .replace(/{%IMAGEPATH%}/g, beer?.imagePath)
    .replace(/{%INGREDIENT_MALT%}/g, beer?.ingredients?.malt.join(`, `))
    .replace(/{%INGREDIENT_HOPS%}/g, beer?.ingredients?.hops.join(`, `))
    .replace(/{%INGREDIENT_YEAST%}/g, beer?.ingredients?.yeast.join(`, `))
    .replace(/{%INGREDIENT_EXTRA%}/g, beer?.ingredients?.extra.join(`, `))
    .replace(/{%INGREDIENT_FRUIT%}/g, beer?.ingredients?.fruit.join(`, `));

  // Handle fruit and extra ingredients.
  if (beer.ingredients?.extra.length === 0) {
    output = output.replace(`beer-card--extra`, `js--hidden`);
  }
  if (beer.ingredients?.fruit.length === 0) {
    output = output.replace(`beer-card--fruit`, `js--hidden`);
  }

  return output;
};

// Sub-Element Construction Functions
/**
 * Constructs a tap card that can be displayed on the overview page using the provided template, svg templates, and beer data.
 * @param {String} tapCardTemplate - Tap card HTML template.
 * @param {String} awardTextTemplate - Award text HTML template.
 * @param {String} pintImageTemplate - SVG templates used to construct pint image using beer data.
 * @param {Object} beer - Beer object containing desired data.
 * @returns {String} - Filled template.
 */
const constructTapCard = function (
  tapCardTemplate,
  awardTextTemplate,
  pintImageTemplate,
  beer
) {
  // Construct SVG's
  let output = tapCardTemplate.replace(`{%PINTSVG%}`, pintImageTemplate);
  output = handleBeerAwardStatus(output, awardTextTemplate, beer);
  output = fillInBeerData(output, beer);
  return output;
};

/**
 * Constructs award text elements based on beer data provided.
 * @param {String} template - Award Text HTML template.
 * @param {Object} beer - Beer object with information that will be placed into template.
 * @returns {String} constructed award elements.
 */
const constructAwardText = function (template, beer) {
  let output = beer.awards
    .map((award) =>
      template
        .replace(`{%AWARD_COMPETITION%}`, award.competition)
        .replace(`{%AWARD_YEAR%}`, award.year)
        .replace(`{%AWARD_LEVEL%}`, award.awardLevel)
    )
    .join("");

  return output;
};

// Page-Building Functions
/**
 * Builds overview page that contains tap cards representing each beer as provided in an array of beer objects.
 * @param {String} tapCardTemplate - HTML template for tap cards.
 * @param {String} awardTextTemplate - Award text HTML template.
 * @param {String} pintImageTemplate - HTML template for pint image svgs.
 * @param {Array[Object]} beers - Array of beer objects to be displayed.
 * @returns {String} - Filled overview template with beer information displayed.
 */
const buildOverviewPage = function (
  tapCardTemplate,
  awardTextTemplate,
  pintImageTemplate,
  beers
) {
  const beerCards = beers
    .map((beer) =>
      constructTapCard(
        tapCardTemplate,
        awardTextTemplate,
        pintImageTemplate,
        beer
      )
    )
    .join("");
  const overview = templateHome.replace(`{%TAPCARDS%}`, beerCards);
  return overview;
};

/**
 * Builds Product detail page that displays information about the requested beer.
 * @param {String} productDetailTemplate - HTML template for product detail page.
 * @param {String} awardTextTemplate - HTML template for award text.
 * @param {Object} beer - Beer object to be displayed.
 * @returns
 */
const buildProductDetailPage = function (
  productDetailTemplate,
  awardTextTemplate,
  beer
) {
  let output = handleBeerAwardStatus(
    productDetailTemplate,
    awardTextTemplate,
    beer
  );
  output = fillInBeerData(output, beer);
  return output;
};

/**
 * Handles the filling (or hiding) of a beer's award status and HTML representation that reflects that status. If a beer has an award, information regarding the award(s) will be added to the provided template. If there is no award, award elements are hidden.
 * @param {String} productDetailTemplate - HTML template for product detail page.
 * @param {String} awardTextTemplate - HTML template for award text.
 * @param {Object} beer - Beer object to be displayed.
 * @returns {String} - The HTML adjusted for award status of the provided beer.
 */
const handleBeerAwardStatus = function (
  productDetailTemplate,
  awardTextTemplate,
  beer
) {
  if (beer.awards.length !== 0) {
    const awardText = constructAwardText(awardTextTemplate, beer);
    output = productDetailTemplate.replace(`{%AWARDS%}`, awardText);
  } else {
    output = productDetailTemplate.replace(`{%HIDDEN%}`, `js--hidden`);
  }
  return output;
};

/**
 * Takes in beer object. Transforms beer name into a slug to be used in the url of a product detail page.
 * @param {Object} beer - The beer whose name will be slugified.
 * @returns {String} - Slugified name of the beer.
 */
const slugifyBeerName = function (beer) {
  let output = "";
  output = slugify(beer?.name, { lower: true });
  return output;
};

////////////////////////////////////////////
// File Reads
// Stylesheets
let stylesheetMain;
let stylesheetIcons;
// HTML Templates
let templateHome;
let templateTapCard;
let templateProductDetails;
let templatePintImage;
let templateAwardText;
// Data
let beerData;
let beers;
let beerPageReference;
// Error
let errorLog;

try {
  stylesheetMain = fs.readFileSync(`${__dirname}/styles/style.css`, `utf-8`);
  stylesheetIcons = fs.readFileSync(`${__dirname}/styles/icons.css`, `utf-8`);

  // HTML Templates
  templateHome = fs.readFileSync(
    `${__dirname}/templates/overview.html`,
    `utf-8`
  );
  templateTapCard = fs.readFileSync(
    `${__dirname}/templates/tap-card.html`,
    `utf-8`
  );
  templateProductDetails = fs.readFileSync(
    `${__dirname}/templates/product-details.html`,
    `utf-8`
  );

  templatePintImage = fs.readFileSync(
    `${__dirname}/templates/pint-image.html`,
    `utf-8`
  );

  templateAwardText = fs.readFileSync(
    `${__dirname}/templates/award-text.html`,
    `utf-8`
  );

  // Data
  beerData = fs.readFileSync(`${__dirname}/data/beer-data.json`, `utf-8`);
  beers = JSON.parse(beerData);

  // Establish product name slugs
  beerPageReference = beers.map((beer) => slugifyBeerName(beer));

  // Catch Errors
} catch (err) {
  errorLog = err;
  console.error(err, `\n File Error`);
}

////////////////////////////////////////////
// Server Logic
const server = http.createServer((req, res) => {
  // Handle file-read errors
  if (errorLog) {
    res.writeHead(404, {
      "Content-type": "text/html",
    });
    res.end(`<h1>There has been a file error!</h1>\n${errorLog}`);
    return;
  }

  const { query, pathname } = url.parse(req.url, true);
  // Serve home page
  if (pathname === `/` || pathname === "/home") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    const overview = buildOverviewPage(
      templateTapCard,
      templateAwardText,
      templatePintImage,
      beers
    );
    res.end(overview);
  }

  // Detail Pages
  else if (pathname === `/beer`) {
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    const beerDetailPage = buildProductDetailPage(
      templateProductDetails,
      templateAwardText,
      beers[beerPageReference.indexOf(query.id)]
    );
    res.end(beerDetailPage);
  }

  // Image
  else if (pathname.includes(`/img`)) {
    const img = fs.readFileSync(`.${pathname}`);
    res.writeHead(200, { "Content-Type": "image/jpg" });
    res.end(img, "binary");
  }

  // Icon Stylesheet
  else if (pathname.includes(`/styles`)) {
    res.writeHead(200, {
      "Content-type": "text/css",
    });

    if (pathname.includes(`style.css`)) {
      res.end(stylesheetMain);
    } else if (pathname.includes(`icons.css`)) {
      res.end(stylesheetIcons);
    } else {
      res.end();
    }
  }

  // Unknown Page
  else {
    res.writeHead(404, {
      "Content-type": "text/html",
    });
    res.end(`<h1>Page not found!</h1>`);
  }
});

server.listen(process.env.PORT || 8000, `127.0.0.1`, () => {
  console.log(`Server online`);
});
