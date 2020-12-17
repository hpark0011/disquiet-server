import './env';
import app from './app';
import sequelize from './database/models';

const PORT = 4000;

try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully!');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

// sequelize.sync({ force: false, alter: true })
//   .then(() => {
//     console.log('Connection has been established successfully!');
//   })
//   .catch((err) => {
//     console.error('Unable to connect to the database:', err);
//   });

app.listen(PORT, () => {
  console.log(`🚀 Disquiet server ready at http://localhost:${PORT}`);
});
