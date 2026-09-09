import app from "./app.js";

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API Faty Store démarrée sur http://localhost:${port}`);
});
