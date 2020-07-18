// // // emit an event
// // io()


// //receive data from server
// const socket = io()
// socket.on('countUpdate',(count)=>{
//     console.log("received data from server in this callback function is count and its value is"+count)
// }) 

 

// // sent data from client to server
// document.querySelector('#increment').addEventListener('click',()=>{
//     socket.emit('increment')
// })  


const socket = io()

// Elements

const $messageForm       =  document.querySelector('#message-form')
const $messageFormInput  =  $messageForm.querySelector('input')
const $messageFormButton =  $messageForm.querySelector('button') 
const $sendLocationButton = document.querySelector('#send-location')
const $messages           = document.querySelector('#messages')

//Templates
const messageTemplate   =  document.querySelector('#message-template').innerHTML
const locationTemplate  =  document.querySelector('#location-template').innerHTML
const sideBarTemplate  =  document.querySelector('#sidebar-template').innerHTML

//Options
//location  = 'url'
// const {username,room}   = Qs.parse(location.search,{ignorQueryPrefix:true})
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
console.log(username,room)


const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}




socket.on('message',(message)=>{
    console.log(message)

    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message: message.text,
        createdAt:moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})



socket.on('locationMessage',(Url)=>{
    console.log(Url)

    const html = Mustache.render(locationTemplate,{
        username:Url.username,
        url:Url.url,
        createdAt:moment(Url.createdAt).format('hh:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})




socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sideBarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html

})



$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    // disable the button
    $messageFormButton.setAttribute('disabled','disabled')

    const message  = e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        //enable the button
        $messageFormButton.removeAttribute('disabled')
        //emtpt the message 
        $messageFormInput.value = ''
        //set the focus into input
        $messageFormInput.focus()

        if(error){
            return  console.log(error)
        }
        console.log("Meaasge deliverd")

    })
})




$sendLocationButton.addEventListener('click',()=>{

    if(!navigator.geolocation){
        return alert("Geolocation is not supported")
    }

    //disable the button
    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log("Location is shared")
        })
    })
})


socket.emit('join',{username:username, room:room},(err)=>{
    if(err){
        alert(err)
        location.href = '/'
    }
    else{
        console.log(`${username} has joined room`)
    }

}) 