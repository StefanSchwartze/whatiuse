import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema({
	title: 			String,
	url: 			String,
	elementsCollections:     [{
		captured:  {
			type: 		Date,
			default: 	Date.now
		},
		elementCollection: [{
			name: 	String,
			count: 	Number
		}]
	}],
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	}
});

export default mongoose.model('page', PageSchema);
