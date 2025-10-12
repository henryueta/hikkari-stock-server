import { onCheckToken } from "./token.js"

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

const onValidateSale = (data)=>{

    const generic_data_checkout = onValidateGenericData(data);

    if(!generic_data_checkout.valid){
        return generic_data_checkout
    }

    if(!data.client_name.length){
        return onValidateMessage("Campos cliente inválido",false)
    }

    if(!data.type.length){
        return onValidateMessage("Campos tipo de venda inválido",false)
    }

    if(!data.products_id.length){
        return onValidateMessage("Campo produtos inválido",false)
    }

    const product_without_id_list = data.products_id.filter((product_item)=>!product_item.product_id.length)

    if(product_without_id_list.length){
        return onValidateMessage("Há campos de identificação de produto inválidos",false)
    }

    const variations_without_size_list = data.products_id.flatMap((product_item)=>
        product_item.variations_id.filter((variation_item=>
            !variation_item.size_id.length
        ))
    )

    if(variations_without_size_list.length){
        return onValidateMessage("Há campos de tamanho de variação inválidos",false)
    }

    const variations_without_id_list = data.products_id.flatMap((product_item)=>
        product_item.variations_id.filter((variation_item=>
            !variation_item.variation_id.length
        ))
    )

    if(variations_without_id_list.length){
        return onValidateMessage("Há campos de identificação de variação inválidos",false)
    }

    const variations_without_quantity_list = data.products_id.flatMap((product_item)=>
        product_item.variations_id.filter((variation_item=>
            !variation_item.quantity
        ))
    )

    if(variations_without_quantity_list.length){
        return onValidateMessage("Há campos de quantidade de variação inválidos",false)
    }

    return onValidateMessage("",true)

}




export {
    onValidateGenericData,
    onValidateProduct,
    onValidateSale,
}