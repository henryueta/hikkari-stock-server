
import database from "../config/supabase.js";
import { onFormatTable } from "../functions/table.js";

(async()=>{

    const result = await database
    .from("vw_table_product")
    .select("*");

    if(result.data){
        const teste = onFormatTable(result.data)
        console.log(teste)
        // const header = Object.keys(result.data[0])
        // // .filter((header_item)=>header_item.toLowerCase() !== 'id')
        // const formated_data = result.data
        //     console.log(header)

        // formated_data.map((table_item)=>{
        //     const data =
        //     Object.values(table_item)
        //     //  Object.entries(table_item).filter((header_data_item)=>
        //     // {   
        //     //     return (header_data_item[0].toLowerCase() !== 'id')
        //     // }
        //     // ).map((data_item)=>data_item[1])
        //     console.log(data)
        // })

        

    }

})()

