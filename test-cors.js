async function run() {
  try {
    const res = await fetch("https://vente-0v5o.onrender.com/api/auth/login", {
      method: "OPTIONS",
      headers: { "Origin": "http://localhost:5173" }
    });
    console.log("Status:", res.status);
    console.log("Data:", await res.text());
  } catch(e) { console.error(e); }
}
run();
