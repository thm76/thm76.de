module.exports = function(passport) {
	return {
		userOnly: function(req, res, next) {
			if (req.user && !req.user.isGuest)
				next();
			else
				passport.authenticate("local", function(err, user) {
					if (err) throw err;
					if (!user)
						res.send(403, "Access denied");
					else
						next();
				})(req, res, next);
		},

		userOrGuest: function(req, res, next) {
			if (req.user)
				next();
			else
				passport.authenticate(["local", "anonymous"])(req, res, function() {
					if (!req.user) req.user = { displayName: "Guest", isGuest: true }
					next();
				});
		},
	}
}