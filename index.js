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
const fillText = function (temp, data) {
  let output = temp.replace(`{%CSSSTYLING%}`, data);
  return output;
};

const fillTapCard = function (temp, beer) {
  let output = temp
    .replace(`{%ID%}`, beer?.id)
    .replace(`{%COLOR%}`, beer?.color)
    .replace(`{%HEADCOLOR%}`, beer?.headColor)
    .replace(`{%NAME%}`, beer?.name)
    .replace(`{%STYLE%}`, beer?.style)
    .replace(`{%ABV%}`, beer?.abv)
    .replace(`{%IBU%}`, beer?.ibu)
    .replace(`{%DESCRIPTION%}`, beer?.description)
    .replace(`{%RELEASEDATE%}`, beer?.releaseDate);
  return output;
};

const fillProductPage = function (temp, beer) {
  let output = temp
    .replace(`{%IMAGEPATH%}`, beer?.imagePath)
    .replace(`{%NAME%}`, beer?.name)
    .replace(`{%STYLE%}`, beer?.style)
    .replace(`{%ABV%}`, beer?.abv)
    .replace(`{%IBU%}`, beer?.ibu)
    .replace(`{%DESCRIPTION%}`, beer?.description)
    .replace(`{%INGREDIENT_MALT%}`, beer?.ingredients?.malt.join(`, `))
    .replace(`{%INGREDIENT_HOPS%}`, beer?.ingredients?.hops.join(`, `))
    .replace(`{%INGREDIENT_YEAST%}`, beer?.ingredients?.yeast.join(`, `))
    .replace(`{%INGREDIENT_EXTRA%}`, beer?.ingredients?.extra.join(`, `))
    .replace(`{%INGREDIENT_FRUIT%}`, beer?.ingredients?.fruit.join(`, `));
  return output;
};

const constructTapCard = function (temp, svgs, beer) {
  // Construct SVG's
  let output = fillTapCard(temp, beer);
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
const home = fs.readFileSync(`${__dirname}/templates/overview.html`, `utf-8`);
const tapCard = fs.readFileSync(
  `${__dirname}/templates/tap-card.html`,
  `utf-8`
);
const productDetails = fs.readFileSync(
  `${__dirname}/templates/product-details.html`,
  `utf-8`
);
const style = fs.readFileSync(`${__dirname}/styles/style.css`, `utf-8`);

const beerData = fs.readFileSync(`${__dirname}/data/beer-data.json`, `utf-8`);
const beers = JSON.parse(beerData);
const svgs = SVGFILEPATHS.map((path) => fs.readFileSync(path, `utf-8`));

////////////////////////////////////////////
// Server Logic
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // Serve home page
  if (pathname === `/` || pathname === "/home") {
    res.writeHead(200, `text/html`);
    const newHome = fillText(home, style);
    // const beerCards = constructTapCard(tapCard, svgs, beers[0]);
    const beerCards = beers
      .map((beer) => constructTapCard(tapCard, svgs, beer))
      .join("");
    const newHome2 = newHome.replace(`{%TAPCARDS%}`, beerCards);
    res.end(newHome2);
  }
  // Detail Pages
  else if (pathname === `/beer`) {
    res.writeHead(200, `text/html`);
    const newPage = fillText(productDetails, style);

    const beerDetailPage = fillProductPage(newPage, beers[query.id]);

    res.end(beerDetailPage);
  }
  // Image
  else if (pathname.includes(`/img`)) {
    // console.log(`this is the image request`);
    // console.log(pathname);
    const img = fs.readFileSync(`.${pathname}`);
    res.writeHead(200, { "Content-Type": "image/jpg" });
    res.end(img, "binary");
  }

  // Unknown Page
});

server.listen(8000, `127.0.0.1`, () => {
  console.log(`Server online`);
});
