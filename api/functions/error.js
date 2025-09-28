import Message from "../classes/Message.js"

const onResponseError = (response,status,message)=>{
        return response.status(status).send(new Message(message))
}

export {
    onResponseError
}