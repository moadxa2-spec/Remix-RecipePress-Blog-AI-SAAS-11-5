async function testOptions() {
  try {
    const res = await fetch('https://recipesforhome.com/wp-json/recipepress-ai/v1/posts', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://ais-dev-l2qhs426fv6cokflllgb3j-73652577237.europe-west3.run.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization',
      }
    });
    console.log('OPTIONS Status:', res.status);
    console.log('OPTIONS Headers:', res.headers);
    const body = await res.text();
    console.log('body:', body);
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

testOptions();
