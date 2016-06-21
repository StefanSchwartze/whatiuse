import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
	title: 			String,
	url: 			String,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	},
	browserscopes: {
		config: {
			browsers: []
		},
		fdx: {
			browsers: [],
			unknown: []
		}
	}
});

export default mongoose.model('project', ProjectSchema);
