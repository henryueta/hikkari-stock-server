import express from "express";
import Message from "../classes/Message.js";
import database from "../config/supabase.js";
import { onResponseError } from "../functions/error.js";
import { onCheckToken } from "../functions/token.js";

const sale_router = express.Router();


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

        if(!data){
            res.status(403).send(new Message("Campos inválidos ou sem atribuição"));
                
            if(typeof data !== 'object'){
                return  res.status(403).send(new Message("Tipo de campos inválidos"))
            }
        
        }
        
        if(!data.client_name.length){
           return res.status(403).send(new Message("Campo cliente inválido"))
        }

        if(!data.type.length){
           return res.status(403).send(new Message("Campo tipo de venda inválido")) 
        }

        if(!data.products_id.length){
           return res.status(403).send(new Message("Campo produtos inválido"))
        }

        const product_without_id_list = data.products_id.filter((product_item)=>!product_item.product_id.length)

        if(product_without_id_list.length){
           return res.status(403).send(new Message("Há campos de identificação de produto inválido"))
        }

        const variations_without_size_list = data.products_id.flatMap((product_item)=>
            product_item.variations_id.filter((variation_item=>
                !variation_item.size_id.length
            ))
        )


        if(variations_without_size_list.length){
           return res.status(403).send(new Message("Há campos de tamanho de variação inválido"))
        }

        const variations_without_id_list = data.products_id.flatMap((product_item)=>
            product_item.variations_id.filter((variation_item=>
                !variation_item.variation_id.length
            ))
        )

        if(variations_without_id_list.length){
           return res.status(403).send(new Message("Há campos de identificação de variação inválido"))
        }

        const variations_without_quantity_list = data.products_id.flatMap((product_item)=>
            product_item.variations_id.filter((variation_item=>
                !variation_item.quantity
            ))
        )

        if(variations_without_quantity_list.length){
           return res.status(403).send(new Message("Há campos de quantidade de variação inválido"))
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

        if(sale_insert.error){
           return res.status(500).send(new Message(sale_insert.error))
        }

        const product_variation_data = await database
        .from("tb_product_variation")
        .select("id,fk_id_variation")
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