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

    if(!data.variations.length){
        return onValidateMessage("Campo variações inválido",false)
    }

    for(const variation of data.variations ){

        if(!variation.name){
            return onValidateMessage("Há variações com campo nome inválido",false)
        }

        if(!variation.quantity){
            return onValidateMessage("Há variações com campo quantidade inválido",false)
        }

    }

    return onValidateMessage("",true)

}

export {
    onValidateProduct
}