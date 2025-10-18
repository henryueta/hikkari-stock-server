import express from "express";
import Message from "../classes/Message.js";
import database from "../config/supabase.js";
import { onResponseError } from "../functions/error.js";
import { onValidateToken } from "../validation/token.js";
import { onValidateSale } from "../validation/sale.js";
import { onCreateTableStructure } from "../functions/table.js";


const sale_router = express.Router();

sale_router.post("/sale/post",async (req,res)=>{

    try {
        const {token}  = req.query;
        const token_validation = onValidateToken(token);

        if(!token_validation.valid){
            return onResponseError(res,401,token_validation.message)
        }

        const {data} = req.body  
        
        const sale_validation = await onValidateSale(data,"post");

          if(!sale_validation.valid){
            return onResponseError(res,401,sale_validation.message)
        }

        let formated_sale_date = {
            sale_type:data.sale_type,
            sale_delivery_type:data.sale_delivery_type,
            initial_price:data.initial_price,
            final_price:data.final_price,
            client_name:data.client_name,
            client_location:data.client_location.toUpperCase()
        }

        if(data.sale_creation_date){
            formated_sale_date = {...{
                creation_date:data.sale_creation_date
            },...formated_sale_date}
        }

        const sale_insert = await database
        .from("tb_sale")
        .insert(formated_sale_date)
        .select("id")

        if(sale_insert.error){
            return onResponseError(res,500,sale_insert.error)
        }

        const sale_product_insert = await database
        .from("tb_sale_product")
        .insert(data.products.map((product_item)=>{
            return {
                fk_id_sale:sale_insert.data[0].id,
                fk_id_product:product_item.product_identifier_id,
                fk_id_variation:product_item.variation_identifier_id,
                quantity:product_item.quantity
            }
        }))

        if(sale_product_insert.error){
            return onResponseError(res,500,sale_product_insert.error)
        }

        for(const product of data.products){

            const variation_quantity_data = await database
            .from("tb_variation")
            .select("quantity")
            .eq("id",product.variation_identifier_id)

            if(variation_quantity_data.error){
                return onResponseError(res,500,variation_quantity_data.error)
            }

            const variation_put = await database
            .from("tb_variation")
            .update({
                quantity:(variation_quantity_data.data[0].quantity - product.quantity)
            })
            .eq("id",product.variation_identifier_id);

            if(variation_put.error){
                return onResponseError(res,500,variation_put.error)
            }

        }

        return res.status(201).send(new Message("Venda cadastrada com sucesso"))
    } catch (error) {
        return onResponseError(res,500,error)
    }

})

sale_router.get("/sale/get",async (req,res)=>{

    try {
        const {token}  = req.query;
        const token_validation = onValidateToken(token);

        if(!token_validation.valid){
            return onResponseError(res,401,token_validation.message)
        }

        const sale_data = await database
        .from("vw_table_sale")
        .select("*");

        if(sale_data.error){
            return onResponseError(res,500,sale_data.error)
        }

        const sale_table = onCreateTableStructure(sale_data.data)

        return res.status(200).send(new Message("Vendas listadas com sucesso",sale_table))

    } catch (error) {
        return onResponseError(res,500,error)
    }

})

sale_router.get("/sale/get-id",async (req,res)=>{
    
    try {
        const {token,id}  = req.query;
        const token_validation = onValidateToken(token);

        if(!token_validation.valid){
            return onResponseError(res,401,token_validation.message)
        }

        if(!id){
            return onResponseError(res,401,"Identificador de produto inválido")
        } 

        const sale_data = await database
        .from("tb_sale")
        .select("sale_type,sale_delivery_type,client_name,client_location,initial_price,final_price,creation_date")
        .eq("id",id)
        .eq("is_deleted",false)

        if(sale_data.error){
            return onResponseError(res,500,sale_data.error)
        }

        const sale_product_data = await database
        .from("tb_sale_product")
        .select("quantity,fk_id_product,fk_id_variation")
        .eq("fk_id_sale",id)

        if(sale_product_data.error){
            return onResponseError(res,500,sale_product_data.error)
        }

        const product_data = await database
        .from("tb_product")
        .select("description,id")
        .in("id",sale_product_data.data.map((sale_product_item)=>sale_product_item.fk_id_product))

        if(product_data.error){
            return onResponseError(res,500,product_data.error)
        }

        const variation_data = await database
        .from("tb_variation")
        .select("name,id")
        .in("id",sale_product_data.data.map((sale_product_item)=>
            sale_product_item.fk_id_variation
        ))

        if(variation_data.error){
            return onResponseError(res,500,variation_data.error)
        }

        const formated_sale_data = {
            type_id:sale_data.data[0].sale_type,
            delivery_type_id:sale_data.data[0].sale_delivery_type,
            initial_price_id:sale_data.data[0].initial_price,
            final_price_id:sale_data.data[0].final_price,
            client_name_id:sale_data.data[0].client_name,
            client_location_id:sale_data.data[0].client_location,
            sale_creation_date_id:(sale_data.data[0].creation_date).split('T')[0],
            products_id:sale_product_data.data.map((sale_product_item,sale_product_index)=>{
                return {
                    ['sale_product_product_id_'+sale_product_index]:product_data.data.find((product_item)=>
                        product_item.id === sale_product_item.fk_id_product
                    ).description,
                    ['sale_product_variation_id_'+sale_product_index]:variation_data.data.find((variation_item)=>
                        variation_item.id === sale_product_item.fk_id_variation
                    ).name,
                    ["sale_product_product_identifier_id_"+sale_product_index]:sale_product_item.fk_id_product,
                    ["sale_product_variation_identifier_id_"+sale_product_index]:sale_product_item.fk_id_variation,
                    ['sale_product_quantity_id_'+sale_product_index]:sale_product_item.quantity
                }
            })
        }

        return res.status(200).send(new Message("Dados de venda listados com sucesso",formated_sale_data))

    } catch (error) {
        return onResponseError(res,500,error)
    }

})

sale_router.put("/sale/put",async (req,res)=>{

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
        const sale_validation = await onValidateSale(data,"put");

        if(!sale_validation.valid){
            return onResponseError(res,401,sale_validation.message)
        }

        const sale_put = await database
        .from("tb_sale")
        .update({
            sale_type:data.sale_type,
            sale_delivery_type:data.sale_delivery_type,
            initial_price:data.initial_price,
            final_price:data.final_price,
            client_name:data.client_name,
            client_location:data.client_location.toUpperCase(),
            creation_date:data.sale_creation_date
        })
        .eq("id",id);
        
        if(sale_put.error){
            return onResponseError(res,500,sale_put.error)
        }

        return res.status(201).send(new Message("Dados de venda alterados com sucesso"))
    } catch (error) {
        return onResponseError(res,500,error)
    }

})

sale_router.delete("/sale/delete",async (req,res)=>{

    try {
        
        const {token,id,stock_devolution}  = req.query;
        const token_validation = onValidateToken(token);

        if(!token_validation.valid){
            return onResponseError(res,401,token_validation.message)
        }

        if(!id){
            return onResponseError(res,401,"Identificador de venda inválido")
        } 
        
        if(!stock_devolution){
            return onResponseError(res,401,"Confirmação de devolução de estoque inválida")
        }   

        console.log("ext",stock_devolution)

        if(stock_devolution === 'true'){
            console.log("inter",stock_devolution)
            const sale_variation_data = await database
            .from("tb_sale_product")
            .select("fk_id_variation,quantity")
            .eq("fk_id_sale",id);

            if(sale_variation_data.error){
                return onResponseError(res,401,sale_variation_data.error)
            }

            const variation_data = await database
            .from("tb_variation")
            .select('quantity,id')
            .in("id",sale_variation_data.data.map((sale_variation_item)=>sale_variation_item.fk_id_variation))

            if(variation_data.error){
                return onResponseError(res,401,variation_data.error)
            }

            for(const sale_variation of sale_variation_data.data){

                const variation_put = await database
                .from("tb_variation")
                .update({
                    quantity:(variation_data.data.find((variation_item)=>
                        variation_item.id === sale_variation.fk_id_variation
                    ).quantity) + sale_variation.quantity
                })
                .eq('id',sale_variation.fk_id_variation)

                if(variation_put.error){
                    return onResponseError(res,401,variation_put.error)
                }

            }       


        }   


        const sale_delete = await database
        .from("tb_sale")
        .update({
            is_deleted:true
        })
        .eq("id",id)

        if(sale_delete.error){
            return onResponseError(res,401,sale_delete.error)
        }
        return res.status(201).send(new Message("Venda deletada com sucesso"))

    } catch (error) {
        return onResponseError(res,500,error)
    }

})

export default sale_router