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
const replaceTemplateText = function (temp, data) {
  let output = temp.replace(`{%CSSSTYLING%}`, data);

  // Check if the data is a beer.
  // TODO - add id back in once non-numerical id system is implemented
  if (data?.color) {
    output = output
      .replace(`{%ID%}`, data?.id)
      .replace(`{%COLOR%}`, data?.color)
      .replace(`{%HEADCOLOR%}`, data?.headColor)
      .replace(`{%NAME%}`, data?.name)
      .replace(`{%STYLE%}`, data?.style)
      .replace(`{%ABV%}`, data?.abv)
      .replace(`{%IBU%}`, data?.ibu)
      .replace(`{%DESCRIPTION%}`, data?.description)
      .replace(`{%RELEASEDATE%}`, data?.releaseDate)
      .replace(`{%IMAGEPATH%}`, data?.imagePath)
      .replace(`{%INGREDIENT_MALT%}`, data?.ingredients?.malt.join(`, `))
      .replace(`{%INGREDIENT_HOPS%}`, data?.ingredients?.hops.join(`, `))
      .replace(`{%INGREDIENT_YEAST%}`, data?.ingredients?.yeast.join(`, `))
      .replace(`{%INGREDIENT_EXTRA%}`, data?.ingredients?.extra.join(`, `))
      .replace(`{%INGREDIENT_FRUIT%}`, data?.ingredients?.fruit.join(`, `));
  }

  return output;
};

const constructTapCard = function (temp, svgs, beer) {
  // Construct SVG's
  let output = replaceTemplateText(temp, beer);
  let svgElements = svgs.map((svg) => constructSVG(svg, beer)).join("");
  output = output.replace(`{%PINTSVG%}`, svgElements);
  return output;
};

const constructSVG = function (svg, beer) {
  const output = svg
    .replace(`{%COLOR%}`, beer?.color)
    .replace(`{%HEADCOLOR%}`, beer?.headColor);
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
const templatesSVG = SVGFILEPATHS.map((path) => fs.readFileSync(path, `utf-8`));

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
    const beerCards = beers
      .map((beer) => constructTapCard(templateTapCard, templatesSVG, beer))
      .join("");
    const home = replaceTemplateText(templateHome, stylesheetMain).replace(
      `{%TAPCARDS%}`,
      beerCards
    );
    res.end(home);
  }

  // Detail Pages
  else if (pathname === `/beer`) {
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    const newPage = replaceTemplateText(templateProductDetails, stylesheetMain);
    const beerDetailPage = replaceTemplateText(newPage, beers[query.id]);
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
