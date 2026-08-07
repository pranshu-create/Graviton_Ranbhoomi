async function testLogin() {
  const url = 'http://localhost:3000/api/admin/login';
  
  const cred = { email: 'pranshu@graviton.in', password: 'pranshu123' };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cred)
    });
    const data = await res.text();
    console.log(`Testing ${cred.email} returned:`, data);
  } catch (e) {
    console.error(`Error testing ${cred.email}:`, e.message);
  }
}

testLogin();
