
class ResponseMessage{
    constructor(message,data){
        this.message = message;
        if(!data){
            this.data = null;
        }
        this.data = data;
    }
}

export default ResponseMessage