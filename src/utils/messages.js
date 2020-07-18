const generateMessage  = (username, text)=>{
    return {
        username: username,
        text:text,
        createdAt:new Date().getTime()
    }
}


const generateUrl  = (username,url)=>{
    return {
        username: username,
        url,
        createdAt:new Date().getTime()
    }
}


module.exports = {
    generateMessage: generateMessage,
    generateUrl: generateUrl
} 