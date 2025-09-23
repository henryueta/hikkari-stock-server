import express from 'express';
import database from '../config/supabase.js';
import { onFormatTable } from '../functions/table.js';
import ResponseMessage from '../classes/ResponseMessage.js';

const product_router = express.Router();

product_router.get("/product/get",async(req,res)=>{

    try {
        
        const product_data = await database
        .from("vw_table_product")
        .select("*");

        if(product_data.error){
            console.log(product_data.error)
            return res.status(500).send({message:product_data.error})
        }

        const product_table = onFormatTable(product_data.data);

        res.status(200).send(new ResponseMessage("Produtos listados com sucesso",product_table))
    
    } catch (error) {
        console.log(error)
        res.status(500).send({message:error})
    }

})


export default product_router