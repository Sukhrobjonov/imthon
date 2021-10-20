const db = require("../modules/db");
const { checkToken } = require("../modules/jwt");

module.exports = async function UserMiddleware(req, res, next) {
    try {
        if (!req.cookies.token) {
            next();
            return;
        }
        const data = await checkToken(req.cookies.token);

        if (!data) {
            next();
            return;
        }

        const session = await db.query(
            `SELECT * FROM user_sessions s JOIN users u ON s.user_id = u.user_id WHERE s.session_id = $1`,
            [data.session_id]
        );

        if (!session) {
            next();
            return;
        }

        req.user = session.rows[0];

        next();
    } catch (error) {
        next();
    }
};
