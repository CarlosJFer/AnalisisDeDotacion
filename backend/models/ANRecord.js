const mongoose = require('mongoose');

const ANRecordSchema = new mongoose.Schema(
  {
    datasetId: { type: mongoose.Schema.Types.ObjectId, ref: 'ANDataset', index: true, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    templateUsed: { type: mongoose.Schema.Types.ObjectId, ref: 'ImportTemplate' },
    sourceFile: { type: String },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true, collection: 'an_records' },
);

ANRecordSchema.index({ datasetId: 1, createdAt: -1 });

module.exports = mongoose.model('ANRecord', ANRecordSchema);

