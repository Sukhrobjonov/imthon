const db = require("../modules/db");

module.exports = class HomeRouteController {
    static async HomeGetController(req, res) {
        const category = await db.query("SELECT * FROM categories");
        res.render("index", {
            user: req.user,
            categories: await category.rows,
        });
    }
};
