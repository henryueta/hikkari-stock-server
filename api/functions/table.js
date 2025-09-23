
const onCreateTable = ()=>{
    return {
        header:[],
        data:[]
    }
}

const onFormatTable = (body)=>{

    const table = onCreateTable();
    const formated_header = Object.keys(body[0]);
    table.header = formated_header;

    if(table.header.length){
        body.map((table_item)=>{
        const formated_data = Object.entries(table_item);
        table.data.push(formated_data);
                //  Object.entries(table_item).filter((header_data_item)=>
                // {   
                //     return (header_data_item[0].toLowerCase() !== 'id')
                // }
                // ).map((data_item)=>data_item[1])
        })
        return table
    }
    return table
}


export {
    onFormatTable
}