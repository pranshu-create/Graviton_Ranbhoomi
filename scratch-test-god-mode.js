async function testGodMode() {
  const loginUrl = 'http://localhost:3000/api/admin/login';
  const godModeUrl = 'http://localhost:3000/api/admin/god-mode';
  
  try {
    // 1. Login to get cookie
    const res = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'pranshu@graviton.in', password: 'Graviton@671123' })
    });
    
    const setCookie = res.headers.get('set-cookie');
    const cookie = setCookie ? setCookie.split(';')[0] : '';
    
    // 2. Trigger God Mode
    const godRes = await fetch(godModeUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({ type: 'FLASH', payload: { color: 'red' } })
    });
    
    const data = await godRes.text();
    console.log(`God Mode Response:`, data);
  } catch (e) {
    console.error(`Error:`, e.message);
  }
}

testGodMode();
