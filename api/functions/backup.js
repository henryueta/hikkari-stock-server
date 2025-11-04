import database from "../config/supabase.js";

const onBackup = async ()=>{


    const product_data = await database.from("tb_product")
    .select("*")

    if(product_data.error){
        throw new Error(product_data.error)
    }

    const product_data_backup = await database
    .storage.from("hikkari-storage/backup").upload("product.json",JSON.stringify(product_data.data),{
        upsert:true
    });

    if(product_data_backup.error){
        throw new Error(product_data_backup.error)
    }

    const variation_data = await database.from("tb_variation")
    .select("*")

    if(variation_data.error){
        throw new Error(variation_data.error)
    }

    const variation_data_backup = await database
    .storage.from("hikkari-storage/backup").upload("variation.json",JSON.stringify(variation_data.data),{
        upsert:true
    });

    if(variation_data_backup.error){
        throw new Error(variation_data_backup.error)
    }

    const sale_data = await database.from("tb_sale")
    .select("*")
    
    if(sale_data.error){
        throw new Error(sale_data.error)
    }

    const sale_data_backup = await database
    .storage.from("hikkari-storage/backup").upload("sale.json",JSON.stringify(sale_data.data),{
        upsert:true
    });

    if(sale_data_backup.error){
        throw new Error(sale_data_backup.error)
    }

    const sale_product_data = await database.from("tb_sale_product")
    .select("*")

    if(sale_product_data.error){
        throw new Error(sale_product_data.error)
    }

    const sale_product_data_backup = await database
    .storage.from("hikkari-storage/backup").upload("sale_product.json",JSON.stringify(sale_product_data.data),{
        upsert:true
    });

    if(sale_product_data_backup.error){
        throw new Error(sale_product_data_backup.error)
    }

    return 

}

export {
    onBackup
}