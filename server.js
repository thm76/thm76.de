var express = require("express")
	, config = require("config").App
	, bodyParser = require("body-parser")
	, cookieParser = require("cookie-parser")
	, session = require("express-session")
	, passport = require("passport")
	, LocalStrategy = require("passport-local").Strategy
	, AnonymousStrategy = require("passport-anonymous").Strategy
	;

var ROOT = config.AppRoot || __dirname;
var LIBROOT = ROOT+ "/lib";
var ROUTERROOT = ROOT + "/routers";

require("pg").connect(config.PgConnectString, function(err, db, done) {
	if (err) throw err;

	var app = express();
	app.set("view engine", "jade");
	app.set("views", ROOT + "/views");
	app.enable("trust proxy");

	// passport
	passport.use(new LocalStrategy(function(username, password, done) {
		console.log("Authenticating " + username + " with password " + password);
		if (username === "thomas" && password === "password") {
			return done(null, {
				displayName: username,
				isGuest: false
			});
		}
		return done(null, false);
	}));
	passport.use(new AnonymousStrategy());
	passport.serializeUser(function(user, done) {
		done(null, user);
	});
	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});

	var auth = require(LIBROOT + "/auth.js")(passport);

	// middleware
	app.use(express.static(ROOT + "/public"));
	app.use(bodyParser());
	app.use(cookieParser());
	app.use(session({ secret: "not so secret" }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(auth.userOrGuest);
	app.use(function(req, res, next) {
		console.log(req.method, req.url, req.query, req.body, req.user);
		next();
	});

	// routes
	app.use("/", require(ROUTERROOT + "/root.js")(express));
	app.use("/account", require(ROUTERROOT + "/account.js")(express, passport, auth));

	// error handling
	app.use(function(err, req, res, next) {
		res.send(500, "Internal server error: " + err);
	});

	// start up server
	app.listen(config.Port, function() {
		console.log("Server is listening on port " + config.Port);
	});	

});