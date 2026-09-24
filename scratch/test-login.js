const { loginUser } = require('./.next/server/app/login/page.js') // Not easily imported

// It's easier to just use fetch to send a POST request to Next.js
async function test() {
  const res = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Next-Action': 'something' // Too complex
    }
  })
}
