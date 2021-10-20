const { MessageValidation } = require("../modules/validations");
const db = require("../modules/db");

module.exports = class MessagesRouteController {
    static async MessagesGetController(req, res) {
        try {
            const receiver_id = await db.query(
                `SELECT * FROM users WHERE user_id = $1`,
                [req.params.id]
            );

            if (!receiver_id.rows) throw new Error("Foydalanuvhci topilmadi");

            const chats = await db.query(
                `SELECT * 
                FROM messages 
                WHERE user_id = $1 
                AND reciver_id = $2 
                OR reciver_id = $1 
                AND user_id = $2
                OR user_id = $2`,
                [req.user.user_id, receiver_id.rows[0].user_id]
            );

            res.render("messages", {
                user: req.user,
                receiver: receiver_id.rows[0],
                chats: await chats.rows,
            });
        } catch (error) {
            console.log(error);
            res.redirect("/");
        }
    }

    static async MessagesPostController(req, res) {
        try {
            const { message_text } = await MessageValidation(req.body);

            const chat = await db.query(
                `INSERT INTO messages(message_text,user_id,reciver_id)
                VALUES ($1,$2,$3)`,
                [message_text, req.user.user_id, req.params?.id]
            );

            res.json({
                ok: true,
            });
        } catch (error) {
            console.log(error);
            res.json({
                ok: false,
                message: error + "",
            });
        }
    }
};
