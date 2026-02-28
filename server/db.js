import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });


/*
const pool = new Pool({
    connectionString:  process.env.DATABASE_URI
});


const test = async () => {
  const res = await pool.query("SELECT NOW()");
  console.log(res.rows);
};

test();
*/