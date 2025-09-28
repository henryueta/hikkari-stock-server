import express from 'express';
import database from '../config/supabase.js';
import { onFormatTable } from '../functions/table.js';
import Message from '../classes/Message.js';
import { onResponseError } from '../functions/error.js';
import { onCheckToken } from '../functions/token.js';

const product_router = express.Router();

product_router.post("/product/post",async (req,res)=>{

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

        if(!data.description.length){
           return res.status(403).send(new Message("Campo descrição inválido"))
        }

        if(!data.cod.length){
          return  res.status(403).send(new Message("Campo código inválido"))
        }

        // if(!data.variations.length){
        //    return res.status(403).send(new Message("Campo variações inválido"))
        // }
        
        const product_insert = await database
        .from("tb_product")
        .insert({
            cod:data.cod,
            description:data.description
        })
        .select("id")

        if(product_insert.error){
           return res.status(500).send(new Message(product_insert.error))
        }

        if(!!data.variations.length && !product_insert.error){

            const variations_insert = await database
            .from("tb_variation")
            .insert(data.variations.map((variation_item)=>
                {
                    return {
                        name:variation_item.name
                    }        
                }
            ))
            .select("id")

            if(variations_insert.error){

                return res.status(500).send(new Message(variations_insert.error))

            }

            const product_variations_insert = await database
            .from("tb_product_variation")
            .insert(variations_insert.data.map((variation_item)=>
                {
                    return {
                        fk_id_product:product_insert.data[0].id,
                        fk_id_variation:variation_item.id
                    }        
                }
            ))

            if(product_variations_insert.error){
                return res.status(500).send(new Message(product_variations_insert.error))
            }

            const variation_size_list = data.variations.map((variation_item,variation_index)=>

                {
                    if(!!variation_item.size.length){
                        return {
                            index:variation_index,
                            data:variation_item
                        };
                    }
                    return null;
                }

            ).filter((variation_item)=>variation_item !== null)

            if(!!variation_size_list.length){

                const size_insert = await database
                .from("tb_size")
                .insert(variation_size_list.map((variation_item)=>
                    {
                        return variation_item.data.size.map((size_item)=>
                            {
                                console.log("AQUI",variations_insert.data.find((id_item,id_index)=>
                                        id_index === variation_item.index
                                    ).id)
                                return {
                                    name:size_item.name,
                                    quantity:size_item.quantity,
                                    fk_id_variation:variations_insert.data.find((id_item,id_index)=>
                                        id_index === variation_item.index
                                    ).id
                                }        
                            }
                        )        
                    }
                ).flat())
                .select('id')

                if(size_insert.error){
                    console.log(size_insert.error)
                    return res.status(500).send(new Message(size_insert.error))
                }

            }
        }
        
       return  res.status(201).send(new Message("Usuário pode cadastrar produto"))

    } catch (error) {
        console.log(error)
        res.status(500).send({message:error})
    }

})

product_router.get("/product/get",async(req,res)=>{

    try {
        
        const product_data = await database
        .from("vw_table_product")
        .select("*");

        if(product_data.error){
            console.log(product_data.error)
            return res.status(500).send({message:product_data.error})
        }

        const product_table = onFormatTable(product_data.data);

        res.status(200).send(new Message("Produtos listados com sucesso",product_table))
    
    } catch (error) {
        console.log(error)
        res.status(500).send({message:error})
    }

})

product_router.get("/product/get/options",async (req,res)=>{

    try {

    const product_data = await database
    .from("tb_product")
    .select("label:description,value:id")

        if(product_data.error){
            return res.status(500).send(new Message(product_data.error))
        }

        return res.status(200).send(new Message("Opções de produto listados com sucesso",product_data))

    } catch (error) {
        console.log(error)
        res.status(500).send(new Message(error))
    }

})

product_router.get("/product/get/options/",async (req,res)=>{

    try {
        
        const {product_id} = req.query

        if(!product_id){
            return res.status(403).send(new Message("Campo identificador de produto inválido"))
        }

        const variation_data = await database
        .from("tb_variation")
        .select("label:name,value:id")

        if(variation_data.error){
            return res.status(500).send(new Message(variation_data.error))
        }



    } catch (error) {
        console.log(error)
        res.status(500).send(new Message(error))
    }

})

export default product_router