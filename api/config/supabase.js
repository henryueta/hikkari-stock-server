import supabase from "@supabase/supabase-js";
import dotenv from "dotenv"
dotenv.config();
const url = process.env.DATABASE_SERVICE_URL;
const role = process.env.DATABASE_SERVICE_ROLE;

const database = supabase.createClient(url,role)

export default database;


