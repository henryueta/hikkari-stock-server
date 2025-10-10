
const onValidateMessage = (message_param,valid_param)=>{

    return {
        message:message_param,
        valid:valid_param
    }

}

const onValidateGenericData = (data)=>{

    if(!data){
        return onValidateMessage("Campos inválidos ou sem atribuição",false)
    } 
        
    if(typeof data !== 'object'){
        return onValidateMessage("Tipo de campos inválidos",false)
    }
    
    return onValidateMessage("",true)
}

export {
    onValidateGenericData,
    onValidateMessage
}