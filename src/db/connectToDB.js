import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const ConnectToDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.BD_URL, {
      dbName: DB_NAME,
    });
    console.log(
      "connected to database || DB Host",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log("Error while connecting to database");
    process.exit(1);
  }
};

export default ConnectToDB;
