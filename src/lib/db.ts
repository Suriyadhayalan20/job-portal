import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local or Vercel dashboard.');
  }

  // If we already have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // Check if we are already connecting
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to avoid some Vercel/Atlas networking issues
    };

    console.log('📡 Attempting to connect to MongoDB...');
    
    // Mask URI for logging (security)
    const maskedUri = MONGODB_URI.replace(/:([^:@]{1,})@/, ':****@');
    console.log(`🔗 Target URI: ${maskedUri}`);

    cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully to database:', mongoose.connection.name);
        return mongoose;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection promise failed:', err.message);
        cached.promise = null; // Reset promise if it failed
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    
    // Set up event listeners for the connection
    mongoose.connection.on('error', (err) => {
      console.error('💥 MongoDB connection edge error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
      cached.conn = null;
      cached.promise = null;
    });

    return cached.conn;
  } catch (e: any) {
    cached.promise = null;
    console.error('🛑 Critical Database Error:', e.message);
    
    if (e.message.includes('authentication failed')) {
      console.error('👉 Tip: Check if your database user password contains special characters that need URL encoding (@ -> %40, # -> %23, etc.)');
    }
    
    throw e;
  }
}

export { connectDB };
export default connectDB;
