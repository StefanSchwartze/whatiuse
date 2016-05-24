import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema({
	title: 			String,
	url: 			String,
	snapshots:     [{
		captured:  {
			type: 		Date,
			default: 	Date.now
		},
		pageSupport: Number,
		browserCollection: [],
		elementCollection: []
	}],
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	}
});

export default mongoose.model('page', PageSchema);
