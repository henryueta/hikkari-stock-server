import express from "express";
import database from "../config/supabase.js";
import hash from "password-hash"
import { onCreateToken } from "../functions/token.js";


const auth_router = express.Router();

auth_router.post("/auth/post",async(req,res)=>{

    try {
        
        const {username,password} = req.body

        console.log(req.body)

        if(!username){
            return res.status(401).send({message:"Campo username inválido"})
        }

        if(!password){
            return res.status(401).send({message:"Campo senha inválido"})
        }

        const username_checkout = await database
        .from("tb_user")
        .select("password,id")
        .eq("username",username)

        if(!username_checkout.data.length){
            return res.status(403).send({message:"Username inválido ou inexistente"})
        }  

        if(!!username_checkout.error){
            return res.status(500).send({message:username_checkout.error})
        }

        const password_checkout = hash.verify(password,username_checkout.data[0].password)

        if(!password_checkout){
            return res.status(403).send({message:"Senha inválida ou inexistente"})
        }

        return res.status(201).send({message:"Usuário logado com sucesso",data:{
            token:onCreateToken(username_checkout.data[0].id)
        }})

    } catch (error) {
        console.log(error)
        res.status(500).send({message:error})
    }

})

export default auth_router