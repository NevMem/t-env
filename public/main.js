window.onload = () => {
    console.log('Hello')
    let socket = io.connect('http://localhost')
    console.log(socket)
    socket.on('message', (data) => {
        console.log(data)
    })
}