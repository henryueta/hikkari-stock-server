import Message from "../classes/Message.js"

const onResponseError = (response,status,message)=>{
        console.log("ERROR.: ",status+" - "+message)
        return response.status(status).send(new Message(message))
}

export {
    onResponseError
}