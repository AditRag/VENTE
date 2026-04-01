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
    console.log("Register Auth:", resReg.status, await resReg.json());

    console.log("Logging in...");
    const resLog = await fetch("https://vente-0v5o.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        password: "password123"
      })
    });
    console.log("Login Auth:", resLog.status, await resLog.json());
  } catch(e) { console.error(e); }
}
run();
