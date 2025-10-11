
import express from "express";
import cors from "cors";
import auth_router from "./routes/auth.js";
import product_router from "./routes/product.js";
import sale_router from "./routes/sale.js";
import sale_product_router from "./routes/sale-product.js";
import sale_variation_router from "./routes/sale-variation.js";
import sale_variation_size_router from "./routes/sale-size.js";
import variation_router from "./routes/variation.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(auth_router);
app.use(product_router);
app.use(variation_router)

app.get("/",(req,res)=>{
    res.status(200).send({message:"Welcome to Hikkari Stock Server"})
})

app.listen(2050,(error)=>{
    if(error){
        console.log(error)
    }
    console.log("Server Online");
});
