import mongoose from 'mongoose';
import app from './app';

const port = process.env.PORT || 5000;
app.listen(port, () => {
  // perform a database connection when server starts
  mongoose.connect(process.env.DB_URL!).then(
    () => {
      console.log("Connected to MongoDB");
    },
    (err) => {
      console.error("Failed to connect to MongoDB", err);
    }
  );
  console.log(`Server is running on port: ${port}`);
});




