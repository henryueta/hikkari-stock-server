import express from "express";
import Message from "../classes/Message.js";
import database from "../config/supabase.js";
import { onResponseError } from "../functions/error.js";
import { onCheckToken } from "../functions/token.js";
import { onValidateSale, onValidateToken } from "../functions/validation.js";

const sale_router = express.Router();

sale_router.put("/sale/put",async (req,res)=>{

    try {
        
        const {token,id} = req.query
        
        const token_validation = onValidateToken(token);

        if(!token_validation.valid){
            return onResponseError(res,403,token_validation.message)
        }

        if(!id){
            return onResponseError(res,403,"Identificador de venda inválido")
        }

        const {data} = req.body

        const sale_validation = onValidateSale(data);
        
        if(!sale_validation.valid){
            return onResponseError(res,403,sale_validation.message)
        }

        // const sale_put = await database
        // .from("tb_sale")
        // .update({
        //     client_name:data.client_name,
        //     sale_type:data.type
        // })
        // .eq("id",id)

        // if(sale_put.error){
        //     return onResponseError(res,500,sale_put.error)
        // }

        const sale_product_data = await database
        .from("tb_sale_product")
        .select("fk_id_product_variation")
        .eq('fk_id_sale',id)
        .eq("is_deleted",false)

        if(sale_product_data.error){
            return onResponseError(res,500,sale_product_data.error)
        }

        const product_variation_data = await database
        .from("tb_product_variation")
        .select("fk_id_product,fk_id_variation,id")
        .in("id",sale_product_data.data.map((sale_product_item)=>
            sale_product_item.fk_id_product_variation
        ));

        if(product_variation_data.error){
            return onResponseError(res,500,product_variation_data.error)
        }

        const request_products = data.products_id.map((product_item)=>
            product_item.product_id
        )

        const preserved_products = product_variation_data.data.filter((sale_product_item)=>
            request_products.includes(sale_product_item.fk_id_product)
        )

        const deleted_products = product_variation_data.data.filter((sale_product_item)=>
            !request_products.includes(sale_product_item.fk_id_product)
        ) 

        const new_products = data.products_id.filter((product_item)=>
         !sale_product_data.data.map((sale_product_variation_item)=>
                sale_product_variation_item.fk_id_product_variation
            ).includes(product_item.identifier)
        )
        
        console.log("novos produtos: ",new_products)

        return res.status(201).send(new Message("Nenhum campo inválido"))

    } catch (error) {
        return onResponseError(res,500,error)
    }

})

sale_router.get("/sale/get-id",async (req,res)=>{

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

        const sale_data = await database
        .from("tb_sale")
        .select("client_name,type:sale_type")
        .eq("is_deleted",false)
        .eq("id",id)

        if(sale_data.error){
            return onResponseError(res,500,sale_data.error)
        }

        const sale_product_variation_data = await database
        .from("tb_sale_product")
        .select("fk_id_product_variation,fk_id_size,quantity,id")
        .eq("is_deleted",false)
        .eq("fk_id_sale",id)

        if(sale_product_variation_data.error){
            return onResponseError(res,500,sale_product_variation_data.error)
        }

        const product_variation_data = await database
        .from("tb_product_variation")
        .select("fk_id_product,fk_id_variation,id")
        .eq("is_deleted",false)
        .in("id",sale_product_variation_data.data.map((product_variation_item)=>
            product_variation_item.fk_id_product_variation
        ))

        if(product_variation_data.error){
            return onResponseError(res,500,product_variation_data.error)
        }

        const product_data = await database
        .from("tb_product")
        .select("value:id")
        .eq("is_deleted",false)
        .in("id",product_variation_data.data.map((product_variation_item)=>
            product_variation_item.fk_id_product
        ))

        if(product_data.error){
            return onResponseError(res,500,product_data.error)
        }

        const variation_data = await database
        .from("tb_variation")
        .select("value:id")
        .eq("is_deleted",false)
        .in("id",product_variation_data.data.map((product_item)=>
            product_item.fk_id_variation
        ))

        if(variation_data.error){
            return onResponseError(res,500,variation_data.error)
        }

        const size_data = await database
        .from("tb_size")
        .select("value:id,fk_id_variation")
        .eq("is_deleted",false)
        .in("id",sale_product_variation_data.data.map((product_variation_item)=>
            product_variation_item.fk_id_size
        ))

        const formated_sale_data = {
            client_name:sale_data.data[0].client_name,
            type:sale_data.data[0].type,
            products_id:product_data.data.map((product_item)=>{
                return {
                    product_id:product_item.value,
                    identifier:product_variation_data.data.find((product_variation_item)=>
                        product_variation_item.fk_id_product === product_item.value
                    ).id,
                    variations_id:product_variation_data.data.filter((product_variation_item)=>
                        product_variation_item.fk_id_product === product_item.value
                    ).map((product_variation_item)=>
                        {
                            return {
                                variation_id:product_variation_item.fk_id_variation,
                                size_id: size_data.data.filter((size_item)=>
                                    size_item.fk_id_variation === product_variation_item.fk_id_variation
                                )[0].value,

                                quantity:sale_product_variation_data.data.filter((sale_product_variation_item)=>
                                    sale_product_variation_item.fk_id_product_variation === product_variation_item.id
                                )[0].quantity
                            }
                        }
                    )
                }
            })
        }

        return res.status(200).send(new Message("Dados de venda listados com sucesso",formated_sale_data))

    } catch (error) {
        console.log(error)
        return onResponseError(res,500,error)
    }

})

sale_router.post("/sale/post",async (req,res)=>{

    try {  
        const {token} = req.query

        if(!token){
            return onResponseError(res,403,"Autenticação inválida")
        }
        const token_checkout = onCheckToken(token);
        if(!token_checkout.validated){
            return onResponseError(res,403,"Token inválido")            
        }       

        const {data} = req.body

        const sale_validation = onValidateSale(data);

        if(!sale_validation.valid){
            return onResponseError(res,403,sale_validation.message)
        }

        const formated_variation_data = data.products_id.flatMap((product_item)=>
            product_item.variations_id.map((variation_item)=>
                {
                    return {
                        variation_id:variation_item.variation_id,
                        quantity:variation_item.quantity,
                        size:variation_item.size_id
                    }
                }
            )
        )
        
        const variation_size_quantity_data = await database
        .from("tb_size")
        .select("quantity,id")
        .eq("is_deleted",false)
        .in("id",formated_variation_data.map((variation_id)=>
            variation_id.size
        ))

        if(variation_size_quantity_data.error){
            return res.status(500).send(new Message(variation_size_quantity_data.error))
        }

        for(const variation_item of formated_variation_data) {

            const previous_quantity = variation_size_quantity_data.data.find((size_item)=>
                size_item.id === variation_item.size
            ).quantity

            if(previous_quantity < variation_item.quantity){
                return res.status(500).send(new Message("Campo quantidade de produto inválido. Verifique se o valor excede o limite estabelecido"))
            }

            const variation_size_put = await database
            .from("tb_size")
            .update({
                quantity:(previous_quantity - variation_item.quantity)
            })
            .eq("id",variation_item.size)

            if(variation_size_put.error){
                return res.status(500).send(new Message(variation_size_put.error))
            }

        };

        const sale_insert = await database
        .from("tb_sale")
        .insert({
            sale_type:data.type,
            client_name:data.client_name
        })
        .select("id")
        .eq("is_deleted",false)

        if(sale_insert.error){
           return res.status(500).send(new Message(sale_insert.error))
        }

        const product_variation_data = await database
        .from("tb_product_variation")
        .select("id,fk_id_variation")
        .eq("is_deleted",false)
        .in("fk_id_product",
            data.products_id.map((product_item)=>
                product_item.product_id
            )
        )
        .in("fk_id_variation",
            formated_variation_data.map((variation_item)=>variation_item.variation_id)
        )

        if(product_variation_data.error){
           return res.status(500).send(new Message(product_variation_data.error))
        }

        const sale_product_insert = await database
        .from("tb_sale_product")
        .insert(
            product_variation_data.data.map((product_variation_item)=>
                {
                    return {
                        fk_id_product_variation:product_variation_item.id,
                        fk_id_sale:sale_insert.data[0].id,
                        fk_id_size:formated_variation_data.find((variation_item)=>
                            variation_item.variation_id === product_variation_item.fk_id_variation
                        ).size, 
                        quantity:formated_variation_data.find((variation_item)=>
                            variation_item.variation_id === product_variation_item.fk_id_variation
                        ).quantity
                    }
                }
            ),
        )

        if(sale_product_insert.error){
           return res.status(500).send(new Message(sale_product_insert.error))
        }

        return res.status(201).send(new Message("Venda cadastrada com sucesso"))

    } catch (error) {
        console.log(error)
        res.status(500).send(new Message(error))       
    }

})



export default sale_router