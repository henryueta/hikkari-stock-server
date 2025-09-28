import express from "express";
import Message from "../classes/Message.js";
import database from "../config/supabase.js";
import { onResponseError } from "../functions/error.js";
import { onCheckToken } from "../functions/token.js";

const sale_router = express.Router();

sale_router.get("/sale/product/get",async (req,res)=>{

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

        return res.status(200).send(new Message("Opções de produto listados com sucesso",product_data))

    } catch (error) {
        console.log(error)
        res.status(500).send(new Message(error))
    }

})

sale_router.get("/sale/variation/get",async (req,res)=>{

    try {
        
        const {token,product_id} = req.query

        if(!token){
            return onResponseError(res,403,"Autenticação inválida")
        }
        const token_checkout = onCheckToken(token);
        if(!token_checkout.validated){
            return onResponseError(res,403,"Token inválido")            
        }

        if(!product_id){
            return res.status(403).send(new Message("Campo identificador de produto inválido"))
        }

        const product_variation_data = await database
        .from("tb_product_variation")
        .select("fk_id_variation")
        .eq("fk_id_product",product_id)

        if(product_variation_data.error){
            console.log(product_variation_data.error)
            return onResponseError(res,500,product_variation_data.error)
        }

        const variation_data = await database
        .from("tb_variation")
        .select("label:name,value:id")
        .in('id',product_variation_data.data.map((product_variation_item)=>
            product_variation_item.fk_id_variation
        ))
        
        if(variation_data.error){
            console.log(variation_data.error)
           return onResponseError(res,500,variation_data.error)
        }

        return res.status(200).send(new Message("Opções de variações listados com sucesso",
            {
                variations_id:variation_data.data
            }
        ))
        
    } catch (error) {
       console.log(error)
       res.status(500).send(new Message(error)) 
    }

})

sale_router.get("/sale/size/get",async (req,res)=>{

    try {
        
        

    } catch (error) {
       console.log(error)
       res.status(500).send(new Message(error)) 
    }

})

export default sale_router