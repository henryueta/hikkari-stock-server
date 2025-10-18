import database from "../config/supabase.js"

    

cron.schedule('30 19 * * *',async () => {
    
    await onBackup();


});


export {
    onBackup
}