import app from './app';
// import Database from './database';

const PORT = 4000;

// const database = new Database();
// database.getConnection();

app.listen(PORT, () => {
  console.log(`🚀 Disquiet server ready at http://localhost:${PORT}/graphql`);
});
