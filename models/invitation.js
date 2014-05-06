module.exports = function(mongoose) {
	var Schema = mongoose.Schema;

	var InvitationSchema = new Schema({
		code: String
		, email: String
		, displayName: String
		, invitedTimestamp: { type: Date, default: Date.now }
		, invitedById: Schema.Types.ObjectId
		, accepted: { type: Boolean, default: false }
	});

	InvitationSchema.statics.findOutstandingByInvitedById = function(invitedById, cb) {
		console.log("findByInvitedId: ", invitedById);
		this.find({ invitedById: invitedById, accepted: false }, cb);
	};

	return mongoose.model("Invitation", InvitationSchema);
}