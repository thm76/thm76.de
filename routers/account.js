

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
	router.route("/signup/:invitationCode?")
		.get(function(req, res) {
			console.log(req.params.invitationCode);
			res.render("account/signup", { invitationCode: req.params.invitationCode });
		})
		.post(function(req, res) {
			console.log("signup post", req.body);
			res.redirect("/");
		});
	router.route("/logout")
		.get(function(req, res) {
			req.logout();
			res.redirect("/");
		});

	router.route("/")
		.all(auth.userOnly)
		.get(function(req, res) {
			res.render("account/index", { user: req.user });
		});

	return router;
}