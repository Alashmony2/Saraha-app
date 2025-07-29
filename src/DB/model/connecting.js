import mongoose from "mongoose";

export function connectDB() {
  mongoose
    .connect("mongodb://127.0.0.1:27017/sara7a-app")
    .then(() => console.log("db is connected successfully"))
    .catch((err) => {
      console.error("Error connecting to the database", err);
    });
}
