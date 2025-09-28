
import express from "express";
import ResponseMessage from "../classes/ResponseMessage";
import database from "../config/supabase";

const variation_router = express.Router();

variation_router.get("/variation/get/options",async (req,res)=>{

    try {

        const {product_id} = req.query

        if(!product_id){
            return res.status(403).send(new ResponseMessage("Campo identificador de produto inválido"));
        }

        const variation_data = await database
        .from("tb_variation")
        .select("label:name,value:id")

        if(variation_data.error){
            return res.status(500).send(new ResponseMessage(variation_data.error))
        }

        return res.status(200).send(new ResponseMessage("Opções de variações listados com sucesso",variation_data))

    } catch (error) {
        console.log(error)
        res.status(500).send(new ResponseMessage(error))
    }

})