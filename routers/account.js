

module.exports = function(express, passport, auth) {
	var router = express.Router();

	router.route("/login")
		.get(function(req, res) {
			res.render("account/login");
		})
		.post(function(req, res) {
			console.log("login post", req.body);
			passport.authenticate("local", { successRedirect: "/account"
										   , failureRedirect: "/account/login" })(req, res);
		});
	router.route("/logout")
		.get(function(req, res) {
			req.logout();
			res.redirect("/");
		});

	router.route("/")
		.all(auth.userOnly)
		.get(function(req, res) {
			res.send("account /");
		});

	return router;
}