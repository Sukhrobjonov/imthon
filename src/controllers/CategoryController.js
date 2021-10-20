const db = require("../modules/db");

module.exports = class CategoryController {
    static async CategoryGetController(req, res) {
        const { id } = req.params;

        const category = await db.query(
            `SELECT * FROM categories WHERE category_id = $1`,
            [id]
        );

        const category_ads = await db.query(
            `SELECT * FROM user_ads WHERE category_id = $1`,
            [id]
        );

        if (!category.rows) {
            res.redirect("/");
            return 0;
        }

        res.render("category", {
            user: req.user,
            category: category.rows[0],
            category_ads: category_ads.rows,
        });
    }
};
