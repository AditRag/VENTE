async function test() {
  try {
    const res = await fetch("https://vente-0v5o.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword123"
      })
    });
    const data = await res.json().catch(e => res.statusText);
    console.log("Response:", res.status, data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
