import database from "../config/supabase.js";
import { onValidateGenericData, onValidateMessage } from "./default.js";

const onValidateSale = async (data,method)=>{

    const generic_data_checkout = onValidateGenericData(data);

    if(!generic_data_checkout.valid){
        return generic_data_checkout
    }

    if(!data.sale_type.length){
        return onValidateMessage("Campo tipo de venda inválido",false)
    }

    if(!data.sale_delivery_type.length){
        return onValidateMessage("Campo tipo de entrega inválido",false)
    }

    if(!data.initial_price.length){
        return onValidateMessage("Campo preço inicial inválido",false)
    }

    if(!data.final_price.length){
        return onValidateMessage("Campo preço final inválido",false)
    }

    if(!data.client_name.length){
        return onValidateMessage("Campo nome de cliente inválido",false)
    }    

    if(!data.client_location.length){
        return onValidateMessage("Campo localidade de cliente inválido",false)
    }        

    if(method.toLowerCase() === 'put' && !data.sale_creation_date.length){
        return onValidateMessage("Campo data de emissão inválido",false)
    }

    if(method.toLowerCase() !== 'put'){

    if( !data.products.length){
        return onValidateMessage("Campo produtos de cliente inválido",false)
    }
    
    for(const product of data.products){

        if(!product.product_identifier_id.length){
            return onValidateMessage("Há produtos com campo identificador de produto inválido",false)
        }

        if(!product.variation_identifier_id.length){
            return onValidateMessage("Há produtos com campo identificador de variação inválido",false)
        }

        if(!product.quantity){
            return onValidateMessage("Há produtos com campo quantidade inválida",false)
        }

        const variation_quantity_data = await database
        .from("tb_variation")
        .select("quantity,name")
        .eq("id",product.variation_identifier_id)

        if(variation_quantity_data.error){
            return onValidateMessage(variation_quantity_data.error,false)
        }

        if(!variation_quantity_data.data[0].quantity){
            return onValidateMessage(
                ("A variação "
                +variation_quantity_data.data[0].name
                +" está sem quantidade no estoque"),
                false)
        }

        if(Number.parseInt(product.quantity) > variation_quantity_data.data[0].quantity){
            return onValidateMessage("Há produtos com campo quantidade inválida",false)
        }

    }

    }
    return onValidateMessage("",true)

}

export {
    onValidateSale
}