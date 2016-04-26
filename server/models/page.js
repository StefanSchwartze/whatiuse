import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema({
	title: 			String,
	url: 			String,
	elementsCollections:     [{
		id:         mongoose.Schema.Types.ObjectId,
		captured:  {
			type: 		Date,
			default: 	Date.now
		},
		elementCollection: [{
			name: 	String,
			share: 	Number
		}]
	}],
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	}
});

export default mongoose.model('page', PageSchema);
