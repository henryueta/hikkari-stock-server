
// // import database from "../config/supabase.js";
// // import { onFormatTable } from "../functions/table.js";

// // (async()=>{

// //     const result = await database
// //     .from("tb_product")
// //     .select("label:description,value:id")

// //     console.log(result)
// //     //produto - variação - tamanho - produto_variação - produto_tamanho 
// //     if(result.data){
// //         console.log(result.data)
// //         // const header = Object.keys(result.data[0])
// //         // // .filter((header_item)=>header_item.toLowerCase() !== 'id')
// //         // const formated_data = result.data
// //         //     console.log(header)

// //         // formated_data.map((table_item)=>{
// //         //     const data =
// //         //     Object.values(table_item)
// //         //     //  Object.entries(table_item).filter((header_data_item)=>
// //         //     // {   
// //         //     //     return (header_data_item[0].toLowerCase() !== 'id')
// //         //     // }
// //         //     // ).map((data_item)=>data_item[1])
// //         //     console.log(data)
// //         // })

        

// //     }

// // })()


// const teste = {
//             client_name:"",
//             products_id:[
//                 {
//                     product_id:"111",
//                     variations_id:[
//                         {
//                             quantity:0,
//                             size_id:"",
//                             variation_id:"222"
//                         },
//                         {
//                             quantity:0,
//                             size_id:"",
//                             variation_id:"333"
//                         }
//                     ]
//                 }
//             ]
//         }

//         const teste2 = teste.products_id.map((product_item)=>
//             product_item.product_id
//         )

//         const teste3 = teste.products_id.flatMap((product_item)=>
//             product_item.variations_id.map((variation_id)=>
//                 {
//                     return {
//                         variation_id:variation_id.variation_id,
//                         size_id:variation_id.size_id
//                     }
//                 }
//             )
//         )

//         const teste4 = teste.products_id.flatMap((product_item)=>
//             product_item.variations_id.map((variation_id)=>
//                 variation_id.size_id
//             )
//         )

//         // console.log(teste2)
//         console.log(teste3)
//         // console.log(teste4)

const teste = {
    variations:[
        {
            identifier:1,
            size:[
                {
                    identifier:"",
                    name:"teste",
                    quantity:10
                },
                {
                    identifier:1,
                    name:"teste2",
                    quantity:4
                }
            ]
        }
    ]
}

const teste2 = [2,1,3]

const teste3 = teste.variations.filter((item)=>
    teste2.includes(item.identifier)
).flatMap((item)=>
    item.size.filter((item2)=>
        !!item2.identifier
    )
    .map((item2)=>
        {
            return {
                id:item.identifier,
                name:item2.name,
                quantity:item2.quantity
            }
        }
    )
)

console.log(teste3)