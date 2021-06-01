/*
 * @Description: 
 * @Author: zhangchuangye
 * @Date: 2021-05-26 19:48:41
 */
const path=require('path')

const HtmlWebpackPlugin=require('html-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'boundle.js',
    },
    module:{
        rules:[
            {
                test:/\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            }
        ]
    },
    devServer:{
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000,
    },
    resolve:{
        extensions:['.js','.jsx']
    },
    plugins:[
        new HtmlWebpackPlugin({  // 
            filename: 'index.html',
            template: 'src/index.html'
          })
    ]
  };