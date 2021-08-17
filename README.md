# Beer Information Website Generator

## Description

This is a project of my own design designed to practice what I have learned up to this point from the following sections in [Jonas Schmedtmann's Node.JS Course](https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/):

- Section 1
- Section 2

App that takes a JSON file containing product information and shows it on an overview page. When an item is clicked, a product page is brought up with more-detailed information. Assets from my [Helsgarding Brewing Website Project](https://github.com/JohnGardiner93/helsgardin-website) will be used as a base.

## Project Requirements:

App will have an overview page and a series of detailed product pages. The overview page will show cards of information indicating what beers are on tap and which are upcoming. When a beer card is clicked, the user will be served a more-detailed product page containing more information about the beer selected.

This site will NOT be responsive. It will be entirely desktop-focused for the time being.

## Usage

This code uses nodemon to host a local server (127.0.0.1:8000, can be configured in index.js). Visiting the aforementioned address on a browser will bring up the main overview page. The overview page will be populated with different information depending on the JSON file's content. Each tap card displayed contains a preview of information about each beer. Click on a tap card to bring up that beer's detailed product information. You can return to the the main page via a "go back" button on the overview page.

## Installation

Use npm to install slugify and nodemon (or whatever server-starting method you prefer)
