import { onValidateGenericData, onValidateMessage } from "./default.js";

const onValidateProduct = (data)=>{

    const generic_data_checkout = onValidateGenericData(data);

    if(!generic_data_checkout.valid){
        return generic_data_checkout
    }

    if(!data.description.length){
        return onValidateMessage("Campo descrição inválido",false)
    }

    if(!data.cod.length){
        return  onValidateMessage("Campo código inválido",false)
    }

    if(!data.type.length){
        return onValidateMessage('Campo tipo inválido',false)
    }

    for(const variation of data.variations ){

        if(!variation.name){
            return onValidateMessage("Há variações com campo nome inválido",false)
        }

    }

    return onValidateMessage("",true)

}

export {
    onValidateProduct
}