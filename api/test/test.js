
import database from "../config/supabase.js";
import { onFormatTable } from "../functions/table.js";

(async()=>{

    const result = await database
    .from("tb_product")
    .select("label:description,value:id")

    console.log(result)
    //produto - variação - tamanho - produto_variação - produto_tamanho 
    if(result.data){
        console.log(result.data)
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

