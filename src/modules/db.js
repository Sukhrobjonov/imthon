const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    password: "2009",
    host: "localhost",
    port: 5432,
    database: "olx",
});

module.exports = pool;
