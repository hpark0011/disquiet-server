export const config = {
  development: {
    database: process.env.MYSQL_DATABASE,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    host: process.env.MYSQL_HOST,
    port: 3306,
    dialect: "mysql",
    // connectTimeout: Number(process.env.CONNECT_TIMEOUT || 1000)
  }
};