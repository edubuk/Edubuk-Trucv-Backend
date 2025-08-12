import mongoose from 'mongoose';

const UrlMapSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  url: {
    type: String,
    required: true
  }
});

const UrlMap = mongoose.model("UrlMap", UrlMapSchema);

export default UrlMap;
