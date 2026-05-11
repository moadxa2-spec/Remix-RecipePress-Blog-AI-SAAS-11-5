async function testFetch() {
  try {
    const res = await fetch('https://recipesforhome.com/wp-json/recipepress-ai/v1/posts', {
      redirect: 'manual'
    });
    console.log('Status:', res.status);
    console.log('Headers:', res.headers);
    const body = await res.text();
    console.log('body:', body);
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

testFetch();
