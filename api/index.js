
import express from "express";
import cors from "cors";
import database from "./config/supabase.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
    res.status(200).send({message:"Welcome to Hikkari Stock Server"})
})

app.listen(2030,(error)=>{
    if(error){
        console.log(error)
    }
    console.log("Server Online");
});
