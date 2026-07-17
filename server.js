import express from 'express';

const app = express();
app.set("view engine", "ejs");
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Welcome to our note taking app!');
});

app.get('/about', (req, res) => {
  res.send('We are a note taking app that is trying to make searching the web more sustainable, meaningful and informative.');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
