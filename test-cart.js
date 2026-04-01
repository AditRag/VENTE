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

    console.log("Fetching /api/cart");
    const resCart = await fetch("https://vente-0v5o.onrender.com/api/cart", {
      method: "GET",
      headers: { "Authorization": "Bearer " + token }
    });
    console.log("Cart Auth:", resCart.status, await resCart.json().catch(e => "err"));
  } catch(e) { console.error(e); }
}
run();
