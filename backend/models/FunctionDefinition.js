const mongoose = require('mongoose');

const functionDefinitionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  endpoint: {
    type: String,
    required: true,
    trim: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE'],
    default: 'GET'
  }
}, {
  timestamps: true
});

let FunctionDefinition;
try {
  FunctionDefinition = mongoose.model('FunctionDefinition');
} catch (error) {
  FunctionDefinition = mongoose.model('FunctionDefinition', functionDefinitionSchema);
}

module.exports = FunctionDefinition;
