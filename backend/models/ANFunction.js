const mongoose = require('mongoose');

const ANFunctionSchema = new mongoose.Schema(
  {
    functionId: { type: Number, required: true, index: true },
    funcion: { type: String, required: true, trim: true },
    agrupamiento: { type: String, default: '', trim: true },
  },
  { timestamps: true, collection: 'an_functions' },
);

ANFunctionSchema.index({ functionId: 1 }, { unique: true });

module.exports = mongoose.model('ANFunction', ANFunctionSchema);

