const { AddAdsValidation } = require("../modules/validations");
const path = require("path");
const { default: slugify } = require("slugify");
const db = require("../modules/db");

module.exports = class AdsRouteController {
    static async AdsAddGetController(req, res) {
        const category = await db.query("SELECT * FROM categories");
        res.render("add_ads", {
            user: req.user,
            categories: await category.rows,
        });
    }
    static async AdsAddPostController(req, res) {
        try {
            const { title, description, price, category, phone } =
                await AddAdsValidation(req.body);

            let photos = [];

            if (req.files?.photos) {
                if (Array.isArray(req.files.photos)) {
                    req.files.photos.forEach(photo => {
                        const name = photo.md5 + ".jpg";
                        photo.mv(
                            path.join(
                                __dirname,
                                "..",
                                "public",
                                "uploads",
                                name
                            )
                        );
                        photos.push(name);
                    });
                } else {
                    const name = req.files.photos.md5 + ".jpg";
                    req.files.photos.mv(
                        path.join(__dirname, "..", "public", "uploads", name)
                    );
                    photos.push(name);
                }
            } else {
                photos.push("no-photo.png");
            }
            const slug =
                slugify(title, {
                    lower: true,
                    strict: true,
                    replacement: "_",
                }) + Date.now();

            let ad = await db.query(
                `INSERT INTO user_ads (
						user_ads_title,
						user_ads_price,
						user_ads_phone,
						user_ads_description,
						user_ads_photos,
						user_ads_slug,
						category_id,
						user_id
					) VALUES (
						$1,
						$2,
						$3,
						$4,
						$5,
						$6,
						$7,
						$8
					)`,
                [
                    title,
                    price,
                    phone,
                    description,
                    photos,
                    slug,
                    category,
                    req.user.user_id,
                ]
            );

            res.redirect("/ads/" + slug);
        } catch (error) {
            const category = await db.query("SELECT * FROM categories");
            res.render("add_ads", {
                user: req.user,
                categories: await category.rows,
                error: error + "",
            });
        }
    }
    static async AdsOneGetController(req, res) {
        const adsOne = await db.query(
            `SELECT * FROM user_ads ua JOIN users u ON ua.user_id = u.user_id JOIN categories c ON ua.category_id = c.category_id  WHERE ua.user_ads_slug = $1`,
            [req.params.slug]
        );

        res.render("ads_page", {
            ads: await adsOne.rows[0],
            user: req.user,
        });
    }
};
