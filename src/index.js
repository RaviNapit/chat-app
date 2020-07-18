const express = require('express')
const path    = require('path')
const http    = require('http')
const socketio= require('socket.io')
const Filter  = require('bad-words')
const {generateMessage, generateUrl} = require('./utils/messages') 
const {addUser,removeUser,getUser,getUsersInRoom}  = require('./utils/user')

const app = express()
// since our socket.io libray require a sever as input 
const server = http.createServer(app)


const PORT = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public') 

//using middleware to serve public directory
app.use(express.static(publicDirectoryPath))


//create a event listener on server side
const io = socketio(server)

// let count = 0 
// //listen for event
// io.on('connection',(socket)=>{
//     console.log("a new connection is create")

//     //send data from sever to client
//     // here socket represents a connection
//     socket.emit('countUpdate',count)

//     //listen for event
//     socket.on('increment',()=>{
//         count++
//         //  for a particular connection
//         // socket.emit('countUpdate',count)

//         // for all the connections
//         io.emit('countUpdate',count) 
    
//     })
// })

io.on('connection',(socket)=>{
    

    socket.on('join',({username,room},callback)=>{

        const { error,user } = addUser({id:socket.id,username,room})
        if(error){
            return callback(error)
        }

        socket.join(user.room)

        //socket.emit socket.broadcast io.emit
        //socket.to.broadcast io.to.emit
        socket.emit('message',generateMessage("Admin","Welcome!"))
        socket.broadcast.to(user.room).emit('message',generateMessage("Admin",`${user.username} has joind`))
    
        io.to(user.room).emit('roomData',{
            room: user.room,
            users:getUsersInRoom(user.room)
        })
       
        callback()
    })


    socket.on('sendMessage',(message,callback)=>{  
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback("Profanity is not allowed")
        }
        user = getUser(socket.id)
        io.to(user.room).emit('message',generateMessage(user.username, message))
        callback()
    }) 



    socket.on('sendLocation',({latitude,longitude},callback)=>{
        user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateUrl(user.username,`https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })


    socket.on('disconnect',()=>{
        const user  = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage("Admin", `${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users:getUsersInRoom(user.room)
            })
           
        }

    })
})




// app.listen(PORT,()=>{
//     console.log("server is running on port"+PORT)
// })  

// due to createServer
server.listen(PORT,()=>{
    console.log("server is running on port"+PORT)
})  