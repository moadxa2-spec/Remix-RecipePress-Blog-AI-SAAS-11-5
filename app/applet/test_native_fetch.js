async function testFetch() {
  try {
    const res = await fetch('https://recipesforhome.com/wp-json/recipepress-ai/v1/posts');
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text.substring(0, 500));
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

testFetch();
