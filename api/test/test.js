
import database from "../config/supabase.js"
import { onCreateTableStructure } from "../functions/table.js"

(async()=>{

  const latest_backup = await database
        .storage.from("hikkari-storage").list('backup')

})()  