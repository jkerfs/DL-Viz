# DL-Viz
Description Logic Visualization and Query Resolution

## Running the Application
1. Install Nodejs and NPM (https://nodejs.org/en/)
2. Install gulp globally: `npm install -g gulp`
3. Clone this repo: `git clone https://github.com/jkerfs/DL-Viz.git`
4. Enter the DL-Viz folder: `cd DL-Viz`
5. Install Dependencies: `npm install`
6. Run Gulp: `gulp serve`
7. Launch a web browser and open `localhost:3000`
8. You can now make changes to the code and the browser will update.

## Project Structure

### /examples
  This folder contains all of the preloaded example files.  Each file is a json
document which consists of three arrays: concepts, roles, and tbox.  These arrays
correspond to the fields in the application.  Prior to adding a new example,
make sure that you use JSONLint (http:/www.jsonlint.com) to check the formatting.

### /scripts
  This folder contains all of the javascript for the project.
  - bootstrap.min.js is BootStrap functions for the modal windows
  - d3.min.js is the v3.0 of D3 (a popular data visualization library)
  - d3-venn.js a plugin for d3 to create Venn Diagrams
  - jquery-2.2.0.min.js the jquery code
  - main.js handles the ui interactions like button presses
  - parser.js converts the text in the boxes to json objects
  - viz.js makes the visualization using d3

### /styles
  This folder contains all of the css for the project.
  - bootstrap-theme.min.css is the generic theme styles
  - bootstrap.min.js is the styles from bootstrap
  - graph.css is the styling for the svg and graph elements
  - main.css is the custom ui styles

### /
  gulpfile.js specifies the scripts required to automatically reload the files when
they are modified in development mode.

  index.html is the markup file that describes the homepage and modal windows.

  LICENSE specifies the licesning information for d3-venn, venn.js and this project.

  package.json is a list of the project's javascript library dependencies

## Method Explanations
