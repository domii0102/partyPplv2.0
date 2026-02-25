import pkg from "pg";
import "dotenv/config"
const {Pool} = pkg;

const pool = new Pool({
    connectionString:  process.env.DATABASE_URI
});


const test = async () => {
  const res = await pool.query("SELECT NOW()");
  console.log(res.rows);
};

test();