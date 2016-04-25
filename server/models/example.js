import mongoose from 'mongoose';
const ExampleSchema = new mongoose.Schema({
    title:          String,
    description:    String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
});

export default mongoose.model('example', ExampleSchema);
