import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) throw new Error('Falta MONGODB_URI');
  try {
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'coder' });
    console.log('--- MongoDB conectado ---');
  } catch (err) {
    console.error('---Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
}
