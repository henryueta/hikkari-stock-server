import express from "express"
import { onResponseError } from "../functions/error.js";
import { onCheckToken } from "../functions/token.js";
import database from "../config/supabase.js";
import Message from "../classes/Message.js";

const sale_product_router = express.Router();

sale_product_router.get("/sale/product/get",async (req,res)=>{

    try {
        
        const {token} = req.query

        if(!token){
            return onResponseError(res,403,"Autenticação inválida")
        }
        const token_checkout = onCheckToken(token);
        if(!token_checkout.validated){
            return onResponseError(res,403,"Token inválido")            
        }

        const product_data = await database
        .from("tb_product")
        .select("label:description,value:id")

        if(product_data.error){
            return onResponseError(res,500,product_data.error)
        }

        return res.status(200).send(new Message("Opções de produto listados com sucesso",[
            {
            field_type:"option",
            name:'product_id',
            value:product_data.data
            }
        ]))

    } catch (error) {
        console.log(error)
        res.status(500).send(new Message(error))
    }

})

export default sale_product_router