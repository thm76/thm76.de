module.exports = function(express) {
	var router = express.Router();

	router.route("/")
		.get(function(req, res) {
			res.render("index", { user: req.user });
		});

	return router;
};