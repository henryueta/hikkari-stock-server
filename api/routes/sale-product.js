import express from "express"
import { onResponseError } from "../functions/error.js";
import { onCheckToken } from "../functions/token.js";
import database from "../config/supabase.js";
import Message from "../classes/Message.js";

const sale_product_router = express.Router();

sale_product_router.post("/sale/product/get-list",async (req,res)=>{

    try {
        
        const {token} = req.query

        if(!token){
            return onResponseError(res,403,"Autenticação inválida")
        }
        const token_checkout = onCheckToken(token);
        if(!token_checkout.validated){
            return onResponseError(res,403,"Token inválido")            
        }   

        const {ids} = req.body
        
        if(!ids.length){
            return onResponseError(res,403,"Lista de identificadores inválida");            
        }

        const variation_data = await database
        .from("tb_variation")
        .select("fk_id_product,name,quantity,id")
        .in("id",ids)
        .eq("is_deleted",false)

        if(variation_data.error){
            return onResponseError(res,500,variation_data.error)
        }

        const product_data = await database
        .from("tb_product")
        .select("description,id")
        .in("id",variation_data.data.map((variation_item)=>
            variation_item.fk_id_product
        ))
        .eq("is_deleted",false)
        
        if(product_data.error){
            return onResponseError(res,500,product_data.error)
        }

        const formated_data = variation_data.data.map((variation_item)=>{
            return {
                product:product_data.data.find((product_item)=>product_item.id === variation_item.fk_id_product).description,
                variation:variation_item.name,
                quantity:variation_item.quantity
            }
        })

        return res.status(200).send(new Message("Produtos e variações listados com sucesso",{
            list:formated_data
        }))

    } catch (error) {
         res.status(500).send(new Message(error))
    }
})

export default sale_product_router