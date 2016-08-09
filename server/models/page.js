import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema({
	title: 			String,
	url: 			String,
	globalSupport: String,
	customSupport: String,
	fdxSupport: String,
	imgSrc: String,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	},
	projectId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'project'
	}
});

export default mongoose.model('page', PageSchema);
