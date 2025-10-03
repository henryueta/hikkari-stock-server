
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

const onValidateProduct = (data,method)=>{

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

        // if(method === 'put'){

        //     if( !variation.identifier){
        //         return onValidateMessage("Há variações com campo identificador inválido",false)
        //     }

        //     const size_id = variation.size.filter((size_item)=>!size_item.identifier)

        //     if(size_id.length){
        //         return onValidateMessage("Há tamanhos com campo identificador inválido",false)
        //     }

        // }

        const size_name = variation.size.filter((size_item)=>!size_item.name);

        if(size_name.length){
            return onValidateMessage("Há tamanhos com campo nome inválido",false)
        }

        const size_quantity = variation.size.filter((size_item)=>Number.parseInt(size_item.quantity) < 0);

        if(size_quantity.length){
            return onValidateMessage("Há tamanhos com campo quantidade inválido",false)
        }

    }

    return onValidateMessage("",true)

}

export {
    onValidateGenericData,
    onValidateProduct
}