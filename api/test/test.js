import cron from "node-cron"

import database from "../config/supabase.js"





// // cron.schedule('45 18 * * *', () => {
    


// // });

// // saveJson.mjs ou index.mjs (ou .js com type: "module" no package.json)

// // Para resolver __dirname no ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Dados para salvar
// const data = {
//   usuario: 'Geraldo',
//   data: new Date().toISOString(),
//   status: 'ok'
// };

// // Caminho do arquivo
// const dir = path.join(__dirname, 'dados');
// const filePath = path.join(dir, 'usuario.json');

// // Função para salvar o JSON
// async function salvarJson() {
//   try {
//     await fs.mkdir(dir, { recursive: true }); // cria pasta se não existir
//     await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
//     console.log('JSON salvo com sucesso em:', filePath);
//   } catch (err) {
//     console.error('Erro ao salvar JSON:', err);
//   }
// }

// salvarJson();


cron.schedule('* * * * *',async () => {
    
   console.log(1)


});