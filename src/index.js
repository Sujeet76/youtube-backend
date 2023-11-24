import app from "./app.js";
import ConnectToDB from "./db/connectToDB.js";

const PORT = process.env.PORT || 8000;

ConnectToDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App is running at port number http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Connection failed : ", err);
  });
