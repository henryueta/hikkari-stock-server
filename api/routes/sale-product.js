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

sale_product_router.get("/sale/product/get-id",async (req,res)=>{

    try {
        
        const {token,id} = req.query

        if(!token){
            return onResponseError(res,403,"Autenticação inválida")
        }
        const token_checkout = onCheckToken(token);
        if(!token_checkout.validated){
            return onResponseError(res,403,"Token inválido")            
        }        

        if(!id){
            return onResponseError(res,403,"Identificador de produto inválido")
        }

        const all_product_data = await database
        .from("tb_product")
        .select("label:description,value:id");
        
        if(all_product_data.error){
            return onResponseError(res,500,all_product_data.error)
        }

        const sale_product_data = await database
        .from("tb_sale_product")
        .select("fk_id_size,fk_id_product_variation")
        .eq("fk_id_sale",id);

        if(sale_product_data.error){
            return onResponseError(res,500,sale_product_data.error)
        }

        const product_variation_data = await database
        .from("tb_product_variation")
        .select("fk_id_product,fk_id_variation")
        .in("id",sale_product_data.data.map((sale_product_item)=>
            sale_product_item.fk_id_product_variation
        ))
        
        if(product_variation_data.error){
            return onResponseError(res,500,product_variation_data.error)
        }

        const variation_data = await database
        .from("tb_variation")
        .select("label:name,value:id")
        .in("id",product_variation_data.data.map((product_variation_item)=>
            product_variation_item.fk_id_variation
        ))

        if(variation_data.error){
            return onResponseError(res,500,variation_data.error)
        }

        const size_data = await database
        .from("tb_size")
        .select("label:name,value:id")
        .in("id",sale_product_data.data.map((sale_product_item)=>
            sale_product_item.fk_id_size
        ))

        if(size_data.error){
            return onResponseError(res,500,size_data.error)
        }

        return res.status(200).send(new Message("Opções de registro para venda listadas com sucesso",[
            {
                field_type:"option",
                name:"product_id",
                value:all_product_data.data
            },
            {
                field_type:"option",
                name:'variation_id',
                value:variation_data.data
            },
            {
                field_type:"option",
                name:"size_id",
                value:size_data.data
            }
        ]))

    } catch (error) {
        console.log(error)
        res.status(500).send(new Message(error))
    }

})

export default sale_product_router