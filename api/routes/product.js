import express from 'express';
import database from '../config/supabase.js';
import Message from '../classes/Message.js';
import { onResponseError } from '../functions/error.js';
import { onValidateToken } from '../validation/token.js';
import {onValidateProduct} from "../validation/product.js"
import {onCreateTableStructure} from "../functions/table.js"

const product_router = express.Router();

product_router.post("/product/post",async (req,res)=>{

    try {
        const {token}  = req.query;
        const token_validation = onValidateToken(token);

        if(!token_validation.valid){
            return onResponseError(res,401,token_validation.message)
        }

        const {data} = req.body

        const product_validation = onValidateProduct(data)

        if(!product_validation.valid){
            return onResponseError(res,401,product_validation.message)
        }

        const product_insert = await database
        .from("tb_product")
        .insert({
            description:data.description,
            cod:data.cod,
            main_variation:data.main_variation,
            type:data.type
        })
        .select("id")
        

        if(product_insert.error){
            return onResponseError(res,500,product_insert.error)
        }

        if(data.variations.length){
            const variation_insert = await database
            .from("tb_variation")
            .insert(data.variations.map((variation_item)=>{
                return {
                    name:variation_item.name,
                    quantity:variation_item.quantity,
                    fk_id_product:product_insert.data[0].id
                }
            })) 
    
            if(variation_insert.error){
                return onResponseError(res,500,variation_insert.error)
            }
        }
        

        return res.status(201).send(new Message("Produto cadastrado com sucesso"))

    } catch (error) {
        return onResponseError(res,500,error)
    }

})

product_router.get("/product/get",async (req,res)=>{

    try {
        const {token}  = req.query;
        const token_validation = onValidateToken(token);

        if(!token_validation.valid){
            return onResponseError(res,401,token_validation.message)
        }

        const {type} = req.query

        const product_data = (
            !!type 
            ? await database
            .from("vw_table_product")
            .select("*")
            .eq("Tipo",
                (
                    type.toLowerCase() === 'ml'
                    ? "Mercado Livre"
                    : 
                    type.toLowerCase() === 'sh'
                    ? "Shopee"
                    : ""
                )
            )
            .limit(5)
            : await database
            .from("vw_table_product")
            .select("*")
        )
        
        if(product_data.error){
            return onResponseError(res,500,product_data.error)
        }

        const product_table = onCreateTableStructure(product_data.data)

        return res.status(200).send(new Message("Produtos listados com sucesso",product_table))


    } catch (error) {
        return onResponseError(res,500,error)
    }

})

product_router.get("/product/get-id",async (req,res)=>{

    try {
        const {token,id}  = req.query;
        const token_validation = onValidateToken(token);

        if(!token_validation.valid){
            return onResponseError(res,401,token_validation.message)
        }

        if(!id){
            return onResponseError(res,401,"Identificador de produto inválido")
        }

        const product_data = await database
        .from("tb_product")
        .select("description,type,main_variation,cod")
        .eq("id",id)
        .eq("is_deleted",false)

        if(product_data.error){
            return onResponseError(res,500,product_data.error)
        }

        const variation_data = await database
        .from("tb_variation")
        .select("name,quantity,id")
        .eq("fk_id_product",id)
        .eq("is_deleted",false)

        if(variation_data.error){
            return onResponseError(res,500,variation_data.error)
        }

    
        return res.status(200).send(new Message("Dados de produto listados com sucesso",{
            description_id:product_data.data[0].description,
            cod_id:product_data.data[0].cod,
            main_variation_id:product_data.data[0].main_variation,
            type_id:product_data.data[0].type,
            variations_id:variation_data.data.map((variation_item,variation_index)=>{
                return {
                    ['variation_name_id_'+variation_index]:variation_item.name,
                    ['variation_quantity_id_'+variation_index]:variation_item.quantity,
                    ['variation_identifier_id_'+variation_index]:variation_item.id,
                }
            })
        }))


    } catch (error) {
        return onResponseError(res,500,error)
    }

})

product_router.put("/product/put",async (req,res)=>{

    try {
        const {token,id}  = req.query;
        const token_validation = onValidateToken(token);

        if(!token_validation.valid){
            return onResponseError(res,401,token_validation.message)
        }

        if(!id){
            return onResponseError(res,401,"Identificador de produto inválido")
        }

        const {data} = req.body

        const product_validation = onValidateProduct(data);

        if(!product_validation.valid){
            return onResponseError(res,401,product_validation.message)
        }

        const product_put = await database
        .from("tb_product")
        .update({
            description:data.description,
            cod:data.cod,
            main_variation:data.main_variation,
            type:data.type
        })  
        .eq("id",id)

        if(product_put.error){
            return onResponseError(res,500,product_put.error)
        }

        const product_variations_data = await database
        .from("tb_variation")
        .select("id")
        .eq("fk_id_product",id)
        .eq("is_deleted",false)

        if(product_variations_data.error){
            return onResponseError(res,500,product_variations_data.error)
        }

        const preserved_variations = data.variations.filter((variation_item)=>
            !!variation_item.identifier
        )

        const new_variations = data.variations.filter((variation_item)=>
            !variation_item.identifier
        )

        const deleted_variations = product_variations_data.data.filter((variation_item)=>
            !preserved_variations
            .map((preserved_variation_item)=>preserved_variation_item.identifier)
            .includes(variation_item.id)
        )


        for(const variation of preserved_variations){

            const variation_put = await database
            .from("tb_variation")
            .update({
                name:variation.name,
                quantity:variation.quantity
            })
            .eq('id',variation.identifier)

            if(variation_put.error){
                return onResponseError(res,500,variation_put.error)
            }

        }


        const variation_delete = await database
        .from("tb_variation")
        .delete()
        .in("id",deleted_variations.map((variation_item)=>variation_item.id))

        if(variation_delete.error){
            return onResponseError(res,500,variation_delete.error)
        }


        const variation_insert = await database
        .from("tb_variation")
        .insert(new_variations.map((variation_item)=>{
            return {
                name:variation_item.name,
                quantity:variation_item.quantity,
                fk_id_product:id
            }
        }))

        if(variation_insert.error){
            return onResponseError(res,500,variation_insert.error)
        }

        return res.status(201).send(new Message("Dados de produto alterados com sucesso"))

    } catch (error) {
        return onResponseError(res,500,error)
    }

})

product_router.delete("/product/delete",async (req,res)=>{

    try {
        const {token,id}  = req.query;
        const token_validation = onValidateToken(token);

        if(!token_validation.valid){
            return onResponseError(res,401,token_validation.message)
        }

        if(!id){
            return onResponseError(res,401,"Identificador de produto inválido")
        }
        
        const product_delete = await database
        .from("tb_product")
        .update({
            is_deleted:true
        })
        .eq("id",id)

        if(product_delete.error){
            console.log(product_delete.error)
            return onResponseError(res,500,product_delete.error)
        }

        return res.status(201).send(new Message("Produto deletado com sucesso"))

    } catch (error) {
        return onResponseError(res,500,error)
    }

})

export default product_router