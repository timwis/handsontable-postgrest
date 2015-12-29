# Handsontable PostgREST
An excel-like database table editor using [Handsontable](http://handsontable.com) and [PostgREST](http://postgrest.com)

# Installation
Clone the repository and install dependencies via `npm install`

# Development
This project uses webpack for compilation of assets. Run `npm start` to watch/recompile/live-reload assets
and use `http://localhost:8080/webpack-dev-server/` to view it. Run `npm test` to run the linter and tests.

To build the application for production, use `npm run build`. To build and deploy the application, ensure 
`deploy.sh` has execute permissions (`chmod +x deploy.sh`) and use `npm run deploy`