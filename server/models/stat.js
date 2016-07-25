import mongoose from 'mongoose';

const StatSchema = new mongoose.Schema({
	created_at:  {
		type: 		Date,
		default: 	Date.now
	},
	browsers: [
		{
			alias: String,
			browser: String,
			version_usage: [
				{
					version: String,
					usage: Number
				}
			]
		}
	]
});

export default mongoose.model('browser', StatSchema);
