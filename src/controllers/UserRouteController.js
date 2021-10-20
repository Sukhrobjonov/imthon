const { SignUpValidation, LoginValidation } = require("../modules/validations");
const { createToken } = require("../modules/jwt");
const db = require("../modules/db");

module.exports = class UserRouteController {
    static async UserRegistrationGetController(req, res) {
        res.render("registration");
    }
    static async UserLoginGetController(req, res) {
        res.render("login");
    }
    static async UserSignUpPostController(req, res) {
        try {
            const { name, email, password } = await SignUpValidation(req.body);

            const user = await db.query(
                `INSERT INTO users (
                    user_name,user_email,user_password
                ) VALUES (
                    $1,
                    $2,
                    crypt(
                    $3, gen_salt('bf',10))
                    ) RETURNING *`,
                [name, email, password]
            );

            res.redirect("/users/login");
        } catch (error) {
            if (error.code === "23505") {
                error = "Error: Foydalanuvchi allaqachon ro'yxatdan o'tgan";
            }
            res.render("registration", {
                error: error + "",
            });
            console.log(error);
        }
    }
    static async UserVerifyGetController(req, res) {
        try {
            const id = req.params.id;

            if (!id) throw new Error("Verification kalit xato)");

            const user = await users.findOne({
                _id: id,
            });

            if (!user) throw new Error("Verification kalit xato)");

            let x = await users.updateOne(
                {
                    _id: id,
                },
                {
                    isVerified: true,
                }
            );

            res.cookie(
                "token",
                await createToken({
                    id: user._id,
                })
            ).redirect("/");
        } catch (error) {
            res.render("login", {
                error: error + "",
            });
        }
    }
    static async UserLoginPostController(req, res) {
        try {
            const { email, password } = await LoginValidation(req.body);

            const user = await db.query(
                `SELECT * FROM users WHERE user_email = $1`,
                [email]
            );

            if (!user.rows[0]) throw new Error("User topilmadi");

            const isTrust = await db.query(
                `SELECT * FROM users WHERE user_password = crypt($1,user_password)`,
                [password]
            );

            if (!isTrust.rows[0]) throw new Error("Parol xato");

            const sessions = await db.query(
                `DELETE FROM user_sessions WHERE user_id = $1`,
                [user.rows[0].user_id]
            );

            const session = await db.query(
                `INSERT INTO user_sessions (session_user_agent,user_id) VALUES ($1,$2) RETURNING *`,
                [req.headers["user-agent"], user.rows[0].user_id]
            );

            res.cookie(
                "token",
                await createToken({
                    session_id: session.rows[0].session_id,
                })
            ).redirect("/");
            res.redirect("/");
        } catch (error) {
            res.render("login", {
                error: error + "",
            });
        }
    }

    static async UserExitGetController(req, res) {
        res.clearCookie("token").redirect("/");
    }
    static async UserProfileGetController(req, res) {
        const user = await db.query(`SELECT * FROM users WHERE user_id = $1`, [
            req.params?.id,
        ]);

        if (!user.rows[0]) {
            res.redirect("/");
            return 0;
        }

        const user_ads = await db.query(
            `SELECT * FROM user_ads WHERE user_id = $1`,
            [user.rows[0].user_id]
        );

        res.render("profile", {
            user: req.user,
            profile: user.rows[0],
            isOwnProfile: req.user.user_id == user.rows[0].user_id,
            user_ads: await user_ads.rows,
        });
    }

    static async UserSessionsGetController(req, res) {
        try {
            const user_sessions = await db.query(
                `SELECT * FROM user_sessions WHERE user_id = $1`,
                [req.user.user_id]
            );

            res.render("sessions", {
                user: req.user,
                user_sessions: user_sessions.rows,
            });
        } catch (error) {
            console.log(error);
            res.redirect("/");
        }
    }

    static async UserSessionDeleteController(req, res) {
        try {
            const session_id = req.params?.id;

            if (!session_id) throw new Error("Sessiya idsida xato bor");

            let sessions = await db.query(
                `DELETE  FROM user_sessions WHERE user_id = $1 AND session_id = $2;`,
                [req.user.user_id, req.params?.id]
            );

            res.redirect("/users/sessions");
        } catch (error) {
            console.log(error);
            res.redirect("/users/sessions");
        }
    }
};
