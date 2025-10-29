
import express from "express";
import database from "../config/supabase.js";
import { onResponseError } from "../functions/error.js";
import { onValidateToken } from "../validation/token.js";
import Message from "../classes/Message.js";
import { onCreateTableStructure } from "../functions/table.js";

const variation_router = express.Router();

variation_router.get("/variation/get",async (req,res)=>{

    try {
        const {token,product_id}  = req.query;
        const token_validation = onValidateToken(token);

        if(!token_validation.valid){
            return onResponseError(res,401,token_validation.message)
        }

        if(!product_id){
            return onResponseError(res,401,"Identificador de produto inválido")
        }

        const variation_data = await database
        .from("vw_table_variation")
        .select("*")
        .eq("product_id",product_id)

        if(variation_data.error){
            return onResponseError(res,500,variation_data.error)
        }

        const variation_table = onCreateTableStructure(variation_data.data)

        return res.status(200).send(new Message("Variações listadas com sucesso",variation_table))

    } catch (error) {
            return onResponseError(res,500,error)
    }

})

variation_router.post("/variation/get-id",async (req,res)=>{

    try {
        const {token}  = req.query;
        const token_validation = onValidateToken(token);

        if(!token_validation.valid){
            return onResponseError(res,401,token_validation.message)
        }

       const {ids} = req.body

        if(!ids.length){
            return onResponseError(res,401,"Identificadores de produto inválidos")
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
        .select("description,type,id")
        .in("id",variation_data.data.map((variation_item)=>
            variation_item.fk_id_product
        ))
        .eq("is_deleted",false)
        
        if(product_data.error){
            return onResponseError(res,500,product_data.error)
        }

        const formated_variation_data = variation_data.data.map((variation_item,variation_index)=>{
            return {
                ["sale_product_product_identifier_id_"+variation_index]:variation_item.fk_id_product,
                ["sale_product_product_id_"+variation_index]:product_data.data
                .find((product_item)=>product_item.id === variation_item.fk_id_product).description,
                ['sale_product_type_id_'+variation_index]:(
                    product_data.data
                .find((product_item)=>product_item.id === variation_item.fk_id_product).type === 'ML'
                ? "Mercado Livre"
                : "Shopee"
                ),
                ["sale_product_variation_identifier_id_"+variation_index]:variation_item.id,
                ["sale_product_variation_id_"+variation_index]:variation_item.name,
                ["sale_product_quantity_id_"+variation_index]:variation_item.quantity
            }
        })
        console.log(formated_variation_data)
        return res.status(200).send(new Message("Dados de variações listados com sucesso",formated_variation_data))

    } catch (error) {
        return onResponseError(res,500,error)
    }

})

export default variation_router