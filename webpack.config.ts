delete process.env.TS_NODE_PROJECT;

import * as webpack from "webpack";
import * as fs from "fs";
import { WebpackOptionsNormalized } from "webpack";
import { ProcessEnvOptions } from "child_process";
import * as path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import lodash from "lodash";
import { Configuration as DevServerConfiguration } from "webpack-dev-server";
import CopyPlugin from "copy-webpack-plugin";

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath: string) =>
  path.resolve(appDirectory, relativePath);

interface Configuration extends webpack.Configuration, DevServerConfiguration {}

interface procenv {
  [key: string]: string | undefined;
}

var normalizedOptions: webpack.WebpackOptionsNormalized;

const isEnvProduction = process.env.NODE_ENV === "production";
const isEnvDevelopment = process.env.NODE_ENV === "development";

const commonConfig: Configuration = {
  devtool: "source-map", //isEnvDevelopment ? "source-map" : false,
  mode: isEnvProduction ? "production" : "development",
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, "dist"),
    globalObject: "this",
  },
  resolve: {
    alias: {
      main: path.resolve(__dirname, "./src/main"),
      public: path.resolve(__dirname, "./src/public"),
      renderer: path.resolve(__dirname, "./src/renderer"),
      model: path.resolve(__dirname, "./src/model"),
    },
    //Add resolving for ts and tsx extensions
    extensions: [".ts", ".tsx", ".js", ".jsx", ".less"],
    modules: ["node_modules", resolveApp("node_modules")],
    fallback: {
      fs: false,
      path: false,
      os: false,
    },
  },
  module: {
    strictExportPresence: true,
    rules: [
      //All files that have ts/tsx should be handled by the ts-loader
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.(scss|css)$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(jpg|png|svg|ico|icns)$/,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
        },
      },
      {
        test: [/\.less$/],
        exclude: /node_modules/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: "[name]__[local]___[hash:base64:5]",
              },
            },
          },
          {
            loader: "less-loader",
            options: {
              importLoaders: 2,
              modules: true,
              localIdentName: "[name]_[local]_[hash:base64:5]",
              javascriptEnabled: true,
            },
          },
        ],
      },
    ],
  },
  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },

    port: process.env.npm_package_config_dev_server_port || 3001,
  },
};

const nodeConfig = lodash.cloneDeep(commonConfig);
nodeConfig.entry = "./src/server/index.ts";
nodeConfig.target = "node";
if (nodeConfig.output) nodeConfig.output.filename = "server.bundle.js";




const webConfig = lodash.cloneDeep(commonConfig);
webConfig.entry = "./src/site/main.tsx";
webConfig.target = "web";
if (webConfig.output) webConfig.output.filename = "main.bundle.js";
webConfig.plugins = [
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, "./src/site/index.html"),
  }),
  new webpack.ProvidePlugin({
    React: "react",
  })
  /*,new CopyPlugin({
    patterns: [
      //{ from: path.resolve(__dirname, "./public/index.css"), to: path.resolve(__dirname, "dist/index.css") },
      //{ from: path.resolve(__dirname, "./public/content"), to: path.resolve(__dirname, "dist/content") },
      //{ from: path.resolve(__dirname, "./src/"), to: path.resolve(__dirname, "./dist") }
    ],
  })*/
];

module.exports = [webConfig, nodeConfig];
