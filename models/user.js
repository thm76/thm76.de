module.exports = function(mongoose) {

	var UserSchema = new mongoose.Schema({
		  email: String
		, displayName: String
		, hash: String
	});

	return mongoose.model("User", UserSchema);
};