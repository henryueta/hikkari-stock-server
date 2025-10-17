import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config();

const token_secret = process.env.TOKEN_SECRET;

const onCreateToken = (id)=>{

    const token = jwt.sign(
        {
        user_id:id
        },
        token_secret
    )

    return token;

}

const onCheckToken = (token)=>{

    if(!token){
        return {
            validated:false,
            value:null
        }
    }

    const token_checkout = jwt.verify(token,token_secret);
    
    return {
        validated:true,
        value:token_checkout['user_id']
    }

}


export {
    onCheckToken,
    onCreateToken,
}