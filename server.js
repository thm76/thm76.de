var express = require("express")
	, config = require("config").App
	, mongodb = require("mongodb")
	, bodyParser = require("body-parser")
	, cookieParser = require("cookie-parser")
	, session = require("express-session")
	, passport = require("passport")
	, LocalStrategy = require("passport-local").Strategy
	, AnonymousStrategy = require("passport-anonymous").Strategy
	, lessMiddleware = require("less-middleware")
	, bcrypt = require("bcrypt")
	, util = require("util")
	, path = require("path")
	;

var ROOT = config.AppRoot || __dirname;
var LIBROOT = ROOT+ "/lib";
var ROUTERROOT = ROOT + "/routers";

mongodb.MongoClient.connect(config.MongoConnectString, function(err, db) {
	if (err) throw err;

	var app = express();
	app.set("view engine", "jade");
	app.set("views", ROOT + "/views");
	app.enable("trust proxy");

	// passport
	passport.use(new LocalStrategy(function(username, password, done) {
		console.log("Authenticating " + username + " with password " + password);

		db.collection("users").findOne({name: username}, function(err, user) {
			if (!user) {
				return done(null, false);
			} else if (bcrypt.compareSync(password, user.hash)) {
				return done(null, user);
			}
			return done(null, false);			
		});
	}));
	passport.use(new AnonymousStrategy());
	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});
	passport.deserializeUser(function(obj, done) {
		db.collection("users").findOne({ _id: mongodb.ObjectID(obj) }, function(err, user) {
			done(null, user);
		})
	});

	var auth = require(LIBROOT + "/auth.js")(passport);

	// middleware
	app.use(lessMiddleware(path.join(ROOT, "public")));
	app.use(express.static(path.join(ROOT, "public")));
	app.use(bodyParser());
	app.use(cookieParser());
	app.use(session({ secret: "not so secret" }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(auth.userOrGuest);
	app.use(function(req, res, next) {
		console.log(req.method, req.url, req.query, req.body);
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