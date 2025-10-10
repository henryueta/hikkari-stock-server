
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
        return Object.entries(product_item)
    })
    
const teste2 = product_data_list.map((item)=>item.map((item2)=>{
    return (
        item2[0] === 'id'
        ? item2[1]+"_decode"
        : item2[1]
    )
}))
    
    console.log(teste2)
})()