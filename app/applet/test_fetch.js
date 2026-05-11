const https = require('https');

https.get('https://recipesforhome.com/wp-json/recipepress-ai/v1/posts', (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);

  let data = '';
  res.on('data', (d) => {
    data += d;
  });
  
  res.on('end', () => {
    console.log('response body:', data.substring(0, 500));
  });

}).on('error', (e) => {
  console.error(e);
});
