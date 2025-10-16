import mongoose from "mongoose";

let cache = global.mongoose;
if (!cache) {
  cache = global.mongoose = { conn: null, promise: null };
}
async function connectDB() {
  if (cache.conn) {
    return cache.conn;
  }
  if (!cache.promise) {
    const opts = {
      bufferCommands: false,
    };
    cache.promise = mongoose
      .connect(`${process.env.MONGODB_URI}/RentEasy-ecommerece`, opts)
      .then((mongoose) => {
        return mongoose;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
export default connectDB;
