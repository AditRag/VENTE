async function run() {
  const email = "test" + Date.now() + "@example.com";
  console.log("Registering", email);
  try {
    const resReg = await fetch("https://vente-0v5o.onrender.com/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: email,
        password: "password123",
        role: "buyer"
      })
    });
    const { token } = await resReg.json();

    console.log("Fetching /api/auth/me");
    const resMe = await fetch("https://vente-0v5o.onrender.com/api/auth/me", {
      method: "GET",
      headers: { "Authorization": "Bearer " + token }
    });
    console.log("Me Auth:", resMe.status, await resMe.json().catch(e => "err"));
  } catch(e) { console.error(e); }
}
run();
