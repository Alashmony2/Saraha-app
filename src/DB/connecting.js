import mongoose from "mongoose";

export function connectDB() {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => console.log("db is connected successfully"))
    .catch((err) => {
      console.error("Error connecting to the database", err);
    });
}
