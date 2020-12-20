import './env';
import app from './app';
import { sequelize } from './database/models';

const PORT = 8000;

// sequelize.authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully!');
//   })
//   .catch((err) => {
//     console.error('Unable to connect to the database:', err);
//   })

sequelize.sync({ force: false, alter: true })
  .then(() => {
    console.log('Connection has been established successfully!');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

app.listen(PORT, () => {
  console.log(`🚀 Disquiet server ready at http://localhost:${PORT}`);
});
