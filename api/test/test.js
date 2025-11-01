
import database from "../config/supabase.js"
import { onCreateTableStructure } from "../functions/table.js"



(async ()=>{

  const data = await database.from("vw_table_product")
  .select("*")
  .limit(5)

  if(data.error){
    return
  }
  const data_table = onCreateTableStructure(data.data)
  console.log(data_table)

})()



// const enviarVestido = async (data)=>{

//    const product_insert = await database.from("tb_product")
//    .insert({
//             description:data.description,
//             cod:"000",
//             main_variation:data.main_variation,
//             type:"SH"
//         })
//    .select("id")
   
//  if(product_insert.error){
//             return onResponseError(res,500,product_insert.error)
//    }

//    if(data.variations.length){
//                const variation_insert = await database
//                .from("tb_variation")
//                .insert(data.variations.map((variation_item)=>{
//                    return {
//                        name:variation_item.name,
//                        quantity:variation_item.quantity,
//                        fk_id_product:product_insert.data[0].id
//                    }
//                })) 
       
//                if(variation_insert.error){
//                    return onResponseError(res,500,variation_insert.error)
//                }
//    }

//    return console.log("sucesso")

// }

// (async ()=>{ await enviarVestido({
//    description:"Calça Legging infantil juvenil Malwee",
//    main_variation:"",
//    variations:[
//         {name:"4",quantity:0},
//       {name:"6",quantity:0},
//       {name:"8",quantity:0},
//       {name:"10",quantity:0},
//       {name:"12",quantity:0},
//       {name:"14",quantity:0},
//       {name:"16",quantity:0}
//     //   {name:"M",quantity:0},
//     //   { name:"G",quantity:0},
//     //   { name:"GG", quantity:0},
//     //   { name:"G1", quantity:0},
//     //   { name:"G2", quantity:0},
//     //   { name:"G3",quantity:0},
//     //   {name:"G4",quantity:1},
//     //   {name:"G5", quantity:0}
//       ]
// })
// })()
  
// // // cron.schedule('45 18 * * *', () => {
    


// // // });

// // // saveJson.mjs ou index.mjs (ou .js com type: "module" no package.json)

// // // Para resolver __dirname no ES Modules
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // // Dados para salvar
// // const data = {
// //   usuario: 'Geraldo',
// //   data: new Date().toISOString(),
// //   status: 'ok'
// // };

// // // Caminho do arquivo
// // const dir = path.join(__dirname, 'dados');
// // const filePath = path.join(dir, 'usuario.json');

// // // Função para salvar o JSON
// // async function salvarJson() {
// //   try {
// //     await fs.mkdir(dir, { recursive: true }); // cria pasta se não existir
// //     await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
// //     console.log('JSON salvo com sucesso em:', filePath);
// //   } catch (err) {
// //     console.error('Erro ao salvar JSON:', err);
// //   }
// // }

// // salvarJson();