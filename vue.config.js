module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  configureWebpack: {
    //Necessary to run npm link https://webpack.js.org/configuration/resolve/#resolve-symlinks
    resolve: {
       symlinks: false
    }
  },

  devServer: {  //Mingzoo, Jan 8, 2020
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
}
