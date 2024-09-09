import mongoose from 'mongoose';

// Define the User Schema
const userSchema = new mongoose.Schema({
  Admin_id: {
    type: String,
    required: true
  },
  gmail_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  given_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  picture: {
    type: String,
    required: true
  },
  access_token: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

// Export the User model
export const User = mongoose.model('User', userSchema);
