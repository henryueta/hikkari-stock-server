
// // // import database from "../config/supabase.js";
// // // import { onFormatTable } from "../functions/table.js";

import database from "../config/supabase.js"

(async()=>{

    const teste = await database
    .from("vw_table_product")
    .select("*");

    const product_header_list = Object.keys(teste.data[0]).map((product_item)=>product_item);

    const product_data_list = teste.data
    .map((product_item)=>{
        return Object.values(product_item)
    })


    
})()