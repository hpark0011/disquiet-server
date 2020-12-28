export const config = {
  development: {
    database: process.env.POSTGRES_DATABASE,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: 5432,
    dialect: "postgres",
    // connectTimeout: Number(process.env.CONNECT_TIMEOUT || 1000)
  }
};