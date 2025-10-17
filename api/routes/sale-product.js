import express from "express"
import { onResponseError } from "../functions/error.js";
import { onCheckToken } from "../functions/token.js";
import database from "../config/supabase.js";
import Message from "../classes/Message.js";

const sale_product_router = express.Router();

// sale_product_router.get("/sale/product/get",async (req,res)=>{

//     try {
        
//         const {token,index,formIndex} = req.query

//         const token_validation = onValidateToken(token);

//         if(!token_validation.valid){
//             return onResponseError(res,403,token_validation.message);
//         }
//         let current_index = index;
//         if(!current_index){
//             current_index = 0;
//         }

//         const product_data = await database
//         .from("tb_product")
//         .select("label:description,value:id")
//         .eq("is_deleted",false)

//         if(product_data.error){
//             return onResponseError(res,500,product_data.error)
//         }

//         return res.status(200).send(new Message("Opções de produto listados com sucesso",[
//             {
//             field_type:"option",
//             name:'product_id',
//             index:current_index,
//             formIndex:formIndex,
//             value:product_data.data
//             }
//         ]))

//     } catch (error) {
//         console.log(error)
//         res.status(500).send(new Message(error))
//     }

// })

// sale_product_router.get("/sale/product/get-id",async (req,res)=>{

//     try {
        
//         const {token,id} = req.query

//         if(!token){
//             return onResponseError(res,403,"Autenticação inválida")
//         }
//         const token_checkout = onCheckToken(token);
//         if(!token_checkout.validated){
//             return onResponseError(res,403,"Token inválido")            
//         }        

//         if(!id){
//             return onResponseError(res,403,"Identificador de produto inválido")
//         }

//         const all_product_data = await database
//         .from("tb_product")
//         .select("label:description,value:id")
//         .eq("is_deleted",false)
        
//         if(all_product_data.error){
//             return onResponseError(res,500,all_product_data.error)
//         }

//         const sale_product_data = await database
//         .from("tb_sale_product")
//         .select("fk_id_size,fk_id_product_variation,index")
//         .eq("fk_id_sale",id)
//         .eq("is_deleted",false)
//         .order("index",{
//         ascending:true
//         })

//         if(sale_product_data.error){
//             return onResponseError(res,500,sale_product_data.error)
//         }

//         const product_variation_data = await database
//         .from("tb_product_variation")
//         .select("fk_id_product,fk_id_variation,id")
//         .eq("is_deleted",false)
//         .in("id",sale_product_data.data.map((sale_product_item)=>
//             sale_product_item.fk_id_product_variation
//         ))
        
//         const variations_of_product = await database
//         .from("tb_product_variation")
//         .select("fk_id_variation,id,fk_id_product")
//         .eq("is_deleted",false)
//         .in("fk_id_product",product_variation_data.data.map((variation_product)=>
//             variation_product.fk_id_product
//         ))

//         if(product_variation_data.error){
//             return onResponseError(res,500,product_variation_data.error)
//         }

//         const variation_data = await database
//         .from("tb_variation")
//         .select("label:name,value:id")
//         .eq("is_deleted",false)
//         .in("id",variations_of_product.data.map((product_variation_item)=>
//             product_variation_item.fk_id_variation
//         ))

//         if(variation_data.error){
//             return onResponseError(res,500,variation_data.error)
//         }

//         const size_data = await database
//         .from("tb_size")
//         .select("label:name,value:id,fk_id_variation")
//         .eq("is_deleted",false)
//         .in("fk_id_variation",product_variation_data.data.map((product_variation_item)=>
//             product_variation_item.fk_id_variation
//         ))

//         if(size_data.error){
//             return onResponseError(res,500,size_data.error)
//         }

//         let variationCounter = {}; 
//         const formated_variation_options = sale_product_data.data.map((sale_product_item,sale_product_index)=>
//         {   
//             const product_id = product_variation_data.data.find((product_variation_item)=>
//                 product_variation_item.id === sale_product_item.fk_id_product_variation
//             ).fk_id_product

//             const variations_id = variations_of_product.data.filter((variation_product_item)=>
//                             variation_product_item.fk_id_product === product_id
//             )

//     if (variationCounter[sale_product_item.index] === undefined) {
//         variationCounter[sale_product_item.index] = 0;
//     }

//     const current_index = variationCounter[sale_product_item.index];

//     variationCounter[sale_product_item.index]++;

//             return {
//                 formIndex:sale_product_item.index,
//                 index:current_index,
//                 field_type:"option",
//                 name:"variation_id",
//                 value:variation_data.data.filter((variation_item)=>{
//                     return (
//                         variations_id.map((variation_item)=>
//                             variation_item.fk_id_variation
//                         ).includes(variation_item.value)
//                     )
//                 })
//             }
//         }
//         )
//         let sizeCounter = {};
//         const formated_size_options = sale_product_data.data.map((sale_product_item)=>{

//               if (sizeCounter[sale_product_item.index] === undefined) {
//                     sizeCounter[sale_product_item.index] = 0;
//                 }

//                 const current_index = sizeCounter[sale_product_item.index];

//                 sizeCounter[sale_product_item.index]++;

//             return {
//                 formIndex:sale_product_item.index,
//                 index:current_index,
//                 field_type:"option",
//                 name:"size_id",
//                 value:size_data.data.filter((size_item)=>
//                 {
//                     return size_item.fk_id_variation === product_variation_data.data.find((product_variation_item)=>
//                         product_variation_item.id === sale_product_item.fk_id_product_variation
//                     ).fk_id_variation
//                 }
//                 ) 
//             }

//         })

//         const formated_options = [...formated_variation_options,...formated_size_options]
//         console.log(formated_options)


//         return res.status(200).send(new Message("Opções de registro para venda listadas com sucesso",[
//             {
//                 formIndex:"",
//                 field_type:"option",
//                 name:"product_id",
//                 value:all_product_data.data
//             },
//             ...formated_options
//         ]))

//     } catch (error) {
//         console.log(error)
//         res.status(500).send(new Message(error))
//     }

// })

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