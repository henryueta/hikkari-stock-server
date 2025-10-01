import express from "express"
import { onResponseError } from "../functions/error.js";
import { onCheckToken } from "../functions/token.js";
import database from "../config/supabase.js";
import Message from "../classes/Message.js";

const sale_variation_router = express.Router();

sale_variation_router.get("/sale/variation/get",async (req,res)=>{

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
        console.log(variation_data.data)
        return res.status(200).send(new Message("Opções de variações listados com sucesso",
            [
                {
                field_type:"option",
                name:'variation_id',
                value:variation_data.data
                }
            ]
        ))
        
    } catch (error) {
       console.log(error)
       res.status(500).send(new Message(error)) 
    }

})

sale_variation_router.get("/sale/variation/size/get",async (req,res)=>{

    try {
        const {token,variation_id} = req.query

        if(!token){
            return onResponseError(res,403,"Autenticação inválida")
        }
        const token_checkout = onCheckToken(token);
        if(!token_checkout.validated){
            return onResponseError(res,403,"Token inválido")            
        }       
      
        if(!variation_id){
            return onResponseError(res,403,"Campo identificador de variação inválido")
        }

        const size_data = await database
        .from("tb_size")
        .select("label:name,value:id")
        .eq("fk_id_variation",variation_id)

        if(size_data.error){
            return onResponseError(res,500,size_data.error);
        }

        return res.status(200).send(new Message("Opções de tamanho listados com sucesso",
            [
                {
                    field_type:"option",
                    name:'size_id',
                    value:size_data.data
                }
            ]
        ))

    } catch (error) {
       console.log(error)
       res.status(500).send(new Message(error)) 
    }

})

export default sale_variation_router