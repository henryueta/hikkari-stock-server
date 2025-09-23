
import express from "express";
import cors from "cors";
import auth_router from "./routes/auth.js";
import product_router from "./routes/product.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(auth_router)
app.use(product_router)

app.get("/",(req,res)=>{
    res.status(200).send({message:"Welcome to Hikkari Stock Server"})
})

app.listen(2030,(error)=>{
    if(error){
        console.log(error)
    }
    console.log("Server Online");
});
