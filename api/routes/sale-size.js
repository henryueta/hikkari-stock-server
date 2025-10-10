import express from "express"
import { onResponseError } from "../functions/error.js";
import { onCheckToken } from "../functions/token.js";
import database from "../config/supabase.js";
import Message from "../classes/Message.js";

const sale_variation_size_router = express.Router();

    sale_variation_size_router.get("/sale/size/quantity/get",async (req,res)=>{

    try {
        const {token,size_id,index,formIndex} = req.query

        if(!token){
            return onResponseError(res,403,"Autenticação inválida")
        }
        const token_checkout = onCheckToken(token);
        if(!token_checkout.validated){
            return onResponseError(res,403,"Token inválido")            
        } 

        if(!size_id){
            return onResponseError(res,403,"Campo identificador de tamanho inválido")
        }

        if(!index){
            return onResponseError(res,403,"Campo index de tamanho inválido")
        }

        const size_quantity_data = await database
        .from("tb_size")
        .select("quantity")
        .eq("is_deleted",false)
        .eq("id",size_id)
        
        if(size_quantity_data.error){
            return onResponseError(res,500,size_quantity_data.error);
        }

        return res.status(200).send(new Message("Quantidade total de variação listada com sucesso",[
            {
                field_type:"number",
                name:"quantity",
                index:index,
                formIndex:formIndex,
                value:size_quantity_data.data[0].quantity
            }
        ]))

    } catch (error) {
        console.log(error)
       res.status(500).send(new Message(error)) 
    }

})

export default sale_variation_size_router