const { checkToken } = require("./jwt");
const { MessageValidation } = require("./validations");
const db = require("../modules/db");

module.exports = function Socket(io) {
    io.on("connection", socket => {
        new_user_check(socket);
        send_message_listener(socket);
    });
};

function new_user_check(socket) {
    socket.on("new_connection", async data => {
        try {
            let token = await checkToken(data.token);

            const user_session = await db.query(
                `UPDATE user_sessions
                SET socket_id = $1
                WHERE session_id = $2`,
                [socket.id, token.session_id]
            );

            socket.emit("connected", {
                ok: true,
            });
        } catch (error) {
            console.log(error);
        }
    });
}

function send_message_listener(socket) {
    socket.on("send_message", async data => {
        const socket_session = await db.query(
            `SELECT * FROM user_sessions
            WHERE socket_id = $1`,
            [socket.id]
        );

        if (!socket_session.rows[0]) return;

        if (
            !(
                data.message_text &&
                data.message_text.length >= 2 &&
                data.message_text.length < 1024
            )
        )
            return;

        const chat = await db.query(
            `INSERT INTO messages (message_text,user_id,reciver_id)
            VALUES ($1,$2,$3)`,
            [
                data.message_text,
                socket_session.rows[0].user_id,
                data.receiver_id,
            ]
        );

        let receiver_session = await db.query(
            `SELECT * FROM user_sessions
            WHERE user_id = $1`,
            [data.receiver_id]
        );

        receiver_session.rows = await receiver_session.rows.map(
            s => s.socket_id
        );

        receiver_session.rows = await receiver_session.rows.filter(s => s);

        socket.to(receiver_session.rows).emit("new_message", data.message_text);
    });
}
