import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema({
	title: 			String,
	url: 			String,
	latestSupport: String,
	imgSrc: String,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	}
});

export default mongoose.model('page', PageSchema);
