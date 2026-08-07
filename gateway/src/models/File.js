const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    primaryServer: { type: String, required: true, enum: ['india', 'singapore', 'germany'], index: true },
    replicatedServers: [{ type: String, enum: ['india', 'singapore', 'germany'] }],
    replicationStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    uploadDate: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

// Compound index to speed up "my files, most recent first" queries
fileSchema.index({ userId: 1, uploadDate: -1 });

module.exports = mongoose.model('File', fileSchema);
