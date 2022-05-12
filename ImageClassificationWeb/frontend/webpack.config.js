const path = require("path");
const webpack = require("webpack");

module.exports = (env, argv) => {
    const mode = argv.mode || 'development';

    return {
        mode,
        entry: "./src/index.js",
        watch: true,
        output: {
            path: path.resolve(__dirname, "./static/frontend"),
            filename: "[name].js",
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                    },
                },
                {
                    test: /\.jsx$/,
                    use: {
                        loader: "babel-loader",
                    },
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.s[ac]ss$/,
                    use: ["style-loader", "css-loader", "sass-loader"],
                },
                {
                    test: /\.png$/,
                    use: {
                        loader: "url-loader?mimetype=image/png"
                    }
                },
                {
                    test: /\.jpg$/,
                    use: {
                        loader: "url-loader?mimetype=image/jpg"
                    }
                },
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader'
                },
                {
                    test: /\.ts?$/,
                    loader: 'ts-loader'
                },
                {
                    test: /\.svg?$/,
                    loader: 'raw-loader',
                }
            ],
        },
        optimization: {
            minimize: true,
        },
        plugins: [
            new webpack.DefinePlugin({
                "process.env": {
                    // This has effect on the react lib size
                    NODE_ENV: JSON.stringify(mode),
                },
            }),
        ],
        resolve: {
            fallback: {
                "fs": false,
                "tls": false,
                "net": false,
                "path": false,
                "zlib": false,
                "http": false,
                "https": false,
                "stream": false,
                "crypto": false,
            },
            extensions: ["*", ".ts", ".tsx", ".js", ".jsx"]
        }
    }
};