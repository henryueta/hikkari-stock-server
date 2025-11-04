import { onValidateMessage } from "./default.js";

const onValidatePagination = (data)=>{

    if(!data.page){
        return onValidateMessage("Pagína de paginação inválida",false)
    }

    if(!data.limit){
        return onValidateMessage("Limite de paginação inválido",false)

    }

    return onValidateMessage("",true)

}

export {
    onValidatePagination
}