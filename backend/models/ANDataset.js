const mongoose = require('mongoose');

const ANDatasetSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    templateIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ImportTemplate' }],
    fileNames: [String],
    totalRecords: { type: Number, default: 0 },
    notes: String,
  },
  { timestamps: true, collection: 'an_datasets' },
);

module.exports = mongoose.model('ANDataset', ANDatasetSchema);

