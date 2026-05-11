import fetch from 'node-fetch';
async function test() {
  try {
    const res = await fetch('https://api-sandbox.pinterest.com/v5/boards');
    console.log(res.status);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
