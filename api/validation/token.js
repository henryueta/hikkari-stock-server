import { onCheckToken } from "../functions/token.js";
import { onValidateMessage } from "./default.js";

const onValidateToken = (token)=>{

        if(!token){
            return onValidateMessage("Autenticação inválida",false)
        }
        const token_checkout = onCheckToken(token);
        if(!token_checkout.validated){
            return onValidateMessage("Token inválido",false)            
        } 

        return onValidateMessage("",true)

}

export {
    onValidateToken
}