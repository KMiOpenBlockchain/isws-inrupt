const path = require("path");
module.exports = {
   mode: "development",
   entry: "./src/inruptlib.js",
   output: {
     path: path.resolve(__dirname, "dist"),
     filename: "inruptlib.js",
     libraryTarget: 'var',
     library: 'Inrupt'
   },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ { loader: "style-loader" }, { loader: "css-loader" } ],
      },
    ]
  },
  devServer: {
    static: "./dist"
  }
};
