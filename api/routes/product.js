import express from 'express';
import database from '../config/supabase.js';
import { onFormatTable } from '../functions/table.js';
import Message from '../classes/Message.js';
import { onResponseError } from '../functions/error.js';
import { onCheckToken } from '../functions/token.js';
import { onValidateProduct } from '../functions/validation.js';

const product_router = express.Router();

product_router.put("/product/put",async (req,res)=>{

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

        const {data} = req.body

        const product_validation = onValidateProduct(data,'put')

        if(!product_validation.valid){
            return onResponseError(res,403,product_validation.message)
        }

        const product_variation_data = await database
        .from("tb_product_variation")
        .select("fk_id_variation")
        .eq("is_deleted",false)
        .eq("fk_id_product",id);

        if(product_variation_data.error){
            return onResponseError(res,500,product_variation_data.error)
        }   

        const product_put = await database
        .from("tb_product")
        .update({
            description:data.description,
            cod:data.cod
        })
        .eq("id",id)
        .eq("is_deleted",false)

        if(product_put.error){
            return onResponseError(res,500,product_put.error)
        }

        const previous_variations = product_variation_data.data.map((product_variation_item)=>
            product_variation_item.fk_id_variation
        )

        const request_variations = data.variations.map((variation_item)=>
            variation_item.identifier
        )

        const new_variations = data.variations.filter((variation_item)=>
            !previous_variations.includes(variation_item.identifier)
        )

        const preserved_variations = previous_variations.filter((product_variation_item)=>
            request_variations.includes(product_variation_item)
        )
        
        const removed_variations = previous_variations.filter((product_variation_item)=>
            !preserved_variations.includes(product_variation_item)
        )

        console.log("Adicionar variações",new_variations)
        console.log("Deletar variações: ",removed_variations)

        for(const variation of data.variations.filter((variation_item)=>
            preserved_variations.includes(variation_item.identifier)
            )){

                const variation_put = await database
                .from("tb_variation")
                .update({
                    name:variation.name
                })
                .eq("id",variation.identifier)

                if(variation_put.error){
                    return onResponseError(res,500,variation_put.error)
                }

            }


        const variation_delete = await database
        .from("tb_variation")
        .update({
            is_deleted:true
        })
        .in("id",removed_variations);

        if(variation_delete.error){
            return onResponseError(res,500,variation_delete.error)
        }

        const variation_insert = await database
        .from("tb_variation")
        .insert(new_variations.map((variation_item)=>{
            return {
                name:variation_item.name
            }
        }))
        .select("id")

        if(variation_insert.error){
            return onResponseError(res,500,variation_insert.error)
        }

        const product_variation_insert = await database
        .from("tb_product_variation")
        .insert(variation_insert.data.map((variation_item)=>{
            return {
                fk_id_product:id,
                fk_id_variation:variation_item.id
            }
        }))

        if(product_variation_insert.error){
            return onResponseError(res,500,product_variation_insert.error)
        }

        const size_data = await database
        .from("tb_size")
        .select("id")
        .eq("is_deleted",false)
        .in("fk_id_variation",preserved_variations)

        if(size_data.error){
            return onResponseError(res,500,size_data.error)
        }

        const previous_size = size_data.data.map((size_item)=>
            size_item.id
        )

        const request_sizes = data.variations.flatMap((variation_item)=>
            variation_item.size.map((size_item)=>
                size_item.identifier
            )
        )

        const new_sizes = data.variations.flatMap((variation_item)=>
            variation_item.size.filter((size_item)=>
                !previous_size.includes(size_item.identifier)
            )
        )

        const preserved_sizes = previous_size.filter((size_item)=>
            request_sizes.includes(size_item)
        )
        
        const removed_sizes = previous_size.filter((size_item)=>
            !preserved_sizes.includes(size_item)
        )

        console.log("Adicionar tamanhos",new_sizes)
        console.log("Deletar tamanhos: ",removed_sizes)


            const variation_size_list = new_variations.map((variation_item,variation_index)=>

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
                        return new_sizes.map((size_item)=>
                            {
                                return {
                                    name:size_item.name,
                                    quantity:size_item.quantity,
                                    fk_id_variation:variation_insert.data.find((_,id_index)=>
                                        id_index === variation_item.index
                                    ).id
                                }        
                            }
                        )        
                    }
                ).flat())
                .select('id')
                .eq("is_deleted",false)
            
                if(size_insert.error){
                    return onResponseError(res,500,size_insert.error)
                }

            }

            for(const size of data.size.filter((size_item)=>
                request_sizes.includes(size_item.identifier)
            )){

                const size_put = await database
                .from("tb_size")
                .update({
                    name:size.name,
                    quantity:size.quantity
                })
                .eq("id",size.identifier)

                if(size_put.error){
                    return onResponseError(res,500,size_put.error)
                }

            }

            const size_delete = await database
            .from("tb_size")
            .update({
                is_deleted:true
            })
            .in('id',removed_sizes)
            .in("fk_id_variation",removed_variations)


            if(size_delete.error){
                return onResponseError(res,500,size_delete.error)
            }

        return res.status(200).send(new Message("Dados de produto alterados com sucesso"))

    } catch (error) {
        console.log(error)
        res.status(500).send({message:error})
    }

})

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
        
        const product_insert = await database
        .from("tb_product")
        .insert({
            cod:data.cod,
            description:data.description
        })
        .select("id")
        .eq("is_deleted",false)

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
                                return {
                                    name:size_item.name,
                                    quantity:size_item.quantity,
                                    fk_id_variation:variations_insert.data.find((_,id_index)=>
                                        id_index === variation_item.index
                                    ).id
                                }        
                            }
                        )        
                    }
                ).flat())
                .select('id')
                .eq("is_deleted",false)

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
        .select("*")

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
    .eq("is_deleted",false)
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
        .eq("is_deleted",false) 
        if(variation_data.error){
            return res.status(500).send(new Message(variation_data.error))
        }



    } catch (error) {
        console.log(error)
        res.status(500).send(new Message(error))
    }

})

product_router.get("/product/get-id",async (req,res)=>{

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

        const product_data = await database
        .from("tb_product")
        .select("description,cod")
        .eq("id",id)
        .eq("is_deleted",false)

        if(product_data.error){
            return onResponseError(res,500,product_data.error)
        }

        const product_variation_data = await database
        .from("tb_product_variation")
        .select("fk_id_variation")
        .eq("fk_id_product",id)
        .eq("is_deleted",false)

        if(product_variation_data.error){
            return onResponseError(res,500,product_variation_data.error)
        }

        const variation_data = await database
        .from("tb_variation")
        .select("name,id")
        .eq("is_deleted",false)
        .in("id",product_variation_data.data.map((product_variation_item)=>
            product_variation_item.fk_id_variation
        ))

        if(variation_data.error){
            return onResponseError(res,500,variation_data.error)
        }

        const variation_size_data = await database
        .from("tb_size")
        .select("name,quantity,fk_id_variation,id")
        .eq("is_deleted",false)
        .in("fk_id_variation",variation_data.data.map((variation_item)=>
            variation_item.id
        ))

        if(variation_size_data.error){
            return onResponseError(res,500,variation_size_data.error)
        }

        const formated_product_data = {
            description:product_data.data[0].description,
            cod:product_data.data[0].cod,
            variations:variation_data.data.map((variation_item)=>
                {
                    return {
                        identifier:variation_item.id,
                        name:variation_item.name,
                        size:variation_size_data.data.filter((size_item)=>
                            size_item.fk_id_variation === variation_item.id
                        ).map((size_item)=>
                            {
                                return {
                                    identifier:size_item.id,
                                    name:size_item.name,
                                    quantity:size_item.quantity
                                }
                            }
                        )
                    }
                }
            )
        }

        return res.status(200).send(new Message("Dados de produto listados com sucesso",formated_product_data))

    } catch (error) {
        console.log(error)
        res.status(500).send(new Message(error))
    }

})

export default product_router