module.exports = class ChatRouteController {
    static async ChatGetController(req, res) {
        res.render("chat", {
            user: req.user,
        });
    }
};
