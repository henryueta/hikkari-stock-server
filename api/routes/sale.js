import express from "express";
import Message from "../classes/Message.js";
import database from "../config/supabase.js";
import { onResponseError } from "../functions/error.js";
import { onCheckToken } from "../functions/token.js";
import { onValidateToken } from "../validation/token.js";
import { onValidateSale } from "../validation/sale.js";


const sale_router = express.Router();

sale_router.post("/sale/post",async (req,res)=>{

    try {
        const {token}  = req.query;
        const token_validation = onValidateToken(token);

        if(!token_validation.valid){
            return onResponseError(res,401,token_validation.message)
        }

        const {data} = req.body  
        
        const sale_validation = onValidateSale(data);

        if(!sale_validation.valid){
            return onResponseError(res,401,sale_validation.message)
        }

        

        return res.status(201).send(new Message("Venda cadastrada com sucesso"))
    } catch (error) {
        return onResponseError(res,500,error)
    }

})



export default sale_router