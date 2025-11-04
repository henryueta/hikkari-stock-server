
const onPaginate = (page,limit)=>{

    page = parseInt(page);
    limit = parseInt(limit);

    const from = (page - 1) * limit
    const to = from + limit - 1

    return {
        from,to
    }

}

export {
    onPaginate
}