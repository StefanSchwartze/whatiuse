import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
	title: 			String,
	url: 			String,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	},
	settings: {
		browsers: []
	}
});

export default mongoose.model('project', ProjectSchema);
