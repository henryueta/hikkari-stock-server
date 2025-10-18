import express from "express";
import { onResponseError } from '../functions/error.js';
import { onValidateToken } from "../validation/token.js";
import database from "../config/supabase.js";
import Message from "../classes/Message.js";

const backup_product_router = express.Router();

backup_product_router.get("/backup/get",async (req,res)=>{

    try {
        
        const {token} = req.query

        const token_validation = onValidateToken(token);

        const product_data = await database
        .from("tb_product")
        .select("id",{count:'exact'})
        .eq("is_deleted",false)
    
        if(product_data.error){
            return onResponseError(res,500,product_data.message)
        }   
    
        const sale_data = await database
        .from("tb_sale")
        .select("id",{count:'exact'})
        .eq("is_deleted",false)
    
        if(sale_data.error){
            return onResponseError(res,500,sale_data.message)
    
        }
    
        const variation_data = await database
        .from("tb_variation")
        .select("id",{count:'exact'})
        .eq("is_deleted",false)
    
        if(variation_data.error){
            return onResponseError(res,500,variation_data.message)
    
        }
    
        const sale_product_data = await database
        .from("tb_sale_product")
        .select("id",{count:'exact'})
        .eq("is_deleted",false)
    
        if(sale_product_data.error){
            return onResponseError(res,500,sale_product_data.message)
    
        }
    
        const database_data_count = product_data.count + sale_data.count + variation_data.count + sale_product_data.count
    

        if(!token_validation.valid){
            return onResponseError(res,401,token_validation.message)
        }

        const latest_backup = await database
        .storage.from("hikkari-storage").list('backup')
        
        if(latest_backup.error){
            return onResponseError(res,500,latest_backup.message)
        }

        const formated_date = {
            day:latest_backup.data[0].updated_at.split('T')[0].split("-")[2],
            month:latest_backup.data[0].updated_at.split('T')[0].split("-")[1],
            year:latest_backup.data[0].updated_at.split('T')[0].split("-")[0]
        }

        return res.status(200).send(new Message("Último registro de backup listado com sucesso",{
            date:formated_date.day+"/"+formated_date.month+"/"+formated_date.year,
            count:database_data_count
        }))

    } catch (error) {
        return onResponseError(res,500,error)
    }


})


export default backup_product_router