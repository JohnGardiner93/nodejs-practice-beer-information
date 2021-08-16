// Requirements
const fs = require("fs");
const url = require("url");
const http = require("http");

/////////////////////////////////////////////
// Constants
SVGFILEPATHS = [
  `./svg/pint-fill.svg`,
  `./svg/pint-head.svg`,
  `./svg/pint-outline.svg`,
];

////////////////////////////////////////////
// Functions
/**
 * Fills a template in with data about the provided beer, if the data exists. Does not supply award data to the template.
 * @param {String} template - HTML template to be filled in.
 * @param {Object} beer - Beer object with information that will be placed into template.
 * @returns {String} - Filled template.
 */
const fillInBeerData = function (template, beer) {
  let output = template
    .replace(`{%ID%}`, beer?.id)
    .replace(`{%NAME%}`, beer?.name)
    .replace(`{%STYLE%}`, beer?.style)
    .replace(`{%ABV%}`, beer?.abv)
    .replace(`{%IBU%}`, beer?.ibu)
    .replace(`{%COLOR%}`, beer?.color)
    .replace(`{%HEADCOLOR%}`, beer?.headColor)
    .replace(`{%DESCRIPTION%}`, beer?.description)
    .replace(`{%IMAGEPATH%}`, beer?.imagePath)
    .replace(`{%INGREDIENT_MALT%}`, beer?.ingredients?.malt.join(`, `))
    .replace(`{%INGREDIENT_HOPS%}`, beer?.ingredients?.hops.join(`, `))
    .replace(`{%INGREDIENT_YEAST%}`, beer?.ingredients?.yeast.join(`, `))
    .replace(`{%INGREDIENT_EXTRA%}`, beer?.ingredients?.extra.join(`, `))
    .replace(`{%INGREDIENT_FRUIT%}`, beer?.ingredients?.fruit.join(`, `));
  return output;
};

// Sub-Element Construction Functions
/**
 * Constructs a tap card that can be displayed on the overview page using the provided template, svg templates, and beer data.
 * @param {String} template - Tap card HTML template.
 * @param {String} svgs - SVG templates used to construct pint image using beer data.
 * @param {Object} beer - Beer object containing desired data.
 * @returns {String} - Filled template.
 */
const constructTapCard = function (template, svgs, beer) {
  // Construct SVG's
  let output = template.replace(`{%PINTSVG%}`, svgs);
  output = fillInBeerData(output, beer);
  return output;
};

  return output;
};

// Page-Building Functions
/**
 * Builds overview page that contains tap cards representing each beer as provided in an array of beer objects.
 * @param {String} tapCardTemplate - HTML template for tap cards.
 * @param {String} SVGTemplate - HTML template for pint image svgs.
 * @param {Array[Object]} beers - Array of beer objects to be displayed.
 * @returns {String} - Filled overview template with beer information displayed.
 */
const buildOverviewPage = function (tapCardTemplate, SVGTemplate, beers) {
  const beerCards = beers
    .map((beer) => constructTapCard(tapCardTemplate, SVGTemplate, beer))
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
  let output = "";
  output = fillInBeerData(output, beer);
  return output;
};

////////////////////////////////////////////
// File Reads
// Stylesheets
const stylesheetMain = fs.readFileSync(
  `${__dirname}/styles/style.css`,
  `utf-8`
);
const stylesheetIcons = fs.readFileSync(
  `${__dirname}/styles/icons.css`,
  `utf-8`
);

// HTML Templates
const templateHome = fs.readFileSync(
  `${__dirname}/templates/overview.html`,
  `utf-8`
);
const templateTapCard = fs.readFileSync(
  `${__dirname}/templates/tap-card.html`,
  `utf-8`
);
const templateProductDetails = fs.readFileSync(
  `${__dirname}/templates/product-details.html`,
  `utf-8`
);
const templateSVGs = SVGFILEPATHS.map((path) =>
  fs.readFileSync(path, `utf-8`)
).join("");

// Data
const beerData = fs.readFileSync(`${__dirname}/data/beer-data.json`, `utf-8`);
const beers = JSON.parse(beerData);

////////////////////////////////////////////
// Server Logic
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // Serve home page
  if (pathname === `/` || pathname === "/home") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    const overview = buildOverviewPage(templateTapCard, templateSVGs, beers);
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
      beers[query.id]
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

server.listen(8000, `127.0.0.1`, () => {
  console.log(`Server online`);
});
