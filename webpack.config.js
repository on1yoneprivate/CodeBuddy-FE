const path = require('path');

module.exports = {
  entry: './src/index.js', // 애플리케이션의 진입점
  output: {
    filename: 'bundle.js', // 번들된 파일 이름
    path: path.resolve(__dirname, 'dist'), // 번들된 파일을 저장할 디렉토리
  },
  module: {
    rules: [
      {
        test: /\.css$/, // .css 파일을 처리하기 위한 규칙
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i, // 이미지 파일을 처리하기 위한 규칙
        type: 'asset/resource',
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'), // 개발 서버가 제공할 파일의 위치
    allowedHosts: 'all', // 모든 호스트 허용
  },
};
