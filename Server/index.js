// 'Socket.IO' is an event-driven library for real-time web applications. It enables real-time, bi-directional communication between web clients and servers.
import { Server } from "socket.io";

const io = new Server(8000, {
    cors: true,
});

const emailToSocketidMap = new Map();
const socketidToEmailMap = new Map();

// Here, 'on' is method & 'connection' is the event anad rest all are the parameters
io.on("connection", (socket) => {
    // A 'Socket' represents a single connection between a client and a server where each the client or server can send and receive data at the same time where Library is based on an event-driven system, 'emit' and 'listen' for specific events to be triggered.
    //Socket is a Link to the Client 
    console.log("socket connected", socket.id);

    socket.on("room:join", (data) => {
        // console.log(data)
        const { email, room } = data;
        emailToSocketidMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);

        // Here, we are broadcasting measage to all the members of 'room' that a new user has joined
        io.to(room).emit("user:joined", { email, id: socket.id })

        // Here, we allowed the user/client to join the 'room'& send the data back as acknowledgement
        socket.join(room)
        io.to(socket.id).emit("room:join", data)
    })

    // Here, we are sending message to recipient for the 'call' made by th calling party
    // 'socket' here refer to the connection established between 'Server' & calling member through event "user:call"
    socket.on("user:call", (data) => {
        const { to, offer } = data;
        io.to(to).emit("incomming:call", { from: socket.id, offer });
    })

    // Here, information/notification is sent back to the Caller/Sender regarding acceptance of 'CALL' by recipient
    socket.on("call:accepted", (data) => {
        const { to, ans } = data;
        io.to(to).emit("call:accepted", { from: socket.id, ans });
    })

    socket.on("peer:nego:needed", (data) => {
        const { offer, to } = data;
        // console.log("peer:nego:needed", offer);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    })

    socket.on("peer:nego:done", (data) => {
        const { ans, to } = data;
        // console.log("peer:nego:done", ans);
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    })
})