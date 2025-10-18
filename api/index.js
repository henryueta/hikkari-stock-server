
import express from "express";
import cors from "cors";
import auth_router from "./routes/auth.js";
import product_router from "./routes/product.js";
import sale_router from "./routes/sale.js";
import variation_router from "./routes/variation.js";
import sale_product_router from "./routes/sale-product.js";
import cron from "node-cron"
import { onBackup } from "./functions/backup.js";
import backup_product_router from "./routes/backup.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(auth_router);
app.use(product_router);
app.use(variation_router);
app.use(sale_router);
app.use(backup_product_router);
app.use(sale_product_router);

cron.schedule('30 19 * * *',async () => {
    
    await onBackup();


});

app.get("/",(req,res)=>{
    res.status(200).send({message:"Welcome to Hikkari Stock Server"})
})

app.listen(2050,(error)=>{
    if(error){
        console.log(error)
    }
    console.log("Server Online");
});
