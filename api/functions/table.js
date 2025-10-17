const onCreateTableStructure = (data)=>{

    const header_list = Object.keys(data[0]).map((data_item)=>data_item);

    const data_list = data
        .map((data_item)=>{
            return Object.entries(data_item)
        })
        .map((data_item)=>data_item.map((data_item_key)=>{
            return (
                data_item_key[0].includes('id')
                ? ((data_item_key[0].includes('_id') && data_item_key[0].length > 2)
                    ? data_item_key[1]+"_foreign_decode"
                    : data_item_key[0].length === 2
                        ? data_item_key[1]+"_decode"
                        : data_item_key[1])              
                : data_item_key[1]
            )
        }))

        return {
            header:header_list,
            data:data_list
        }

}

export {
    onCreateTableStructure
}