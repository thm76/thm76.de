var util = require("util");

module.exports = function(express, passport, auth, Models) {
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
			if (req.params.invitationCode) {
				Models.Invitation.findOne({code: req.params.invitationCode}, function(err, invitation) {
					res.render("account/signup", { invitation: invitation });
				})
			} else {
				res.render("account/signup", { });
			}
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
		.all(function(req, res, next) {
			Models.Invitation.findOutstandingByInvitedById(req.user._id, function(err, invitations) {
				req.user.invitations = invitations;
				next();
			})
		})
		.get(function(req, res) {
			console.log(util.inspect(req.user));
			res.render("account/index", { user: req.user });
		});

	return router;
}