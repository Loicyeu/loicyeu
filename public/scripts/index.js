const uuid = getCookie("uuid");
if(uuid === null) disconnect();
else {
    socket.emit("isConnected", uuid, function (res) {
        if(!res) disconnect();
    });
}