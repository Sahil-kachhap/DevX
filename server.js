const app = require("./app.js");
const {connectDB} = require("./config/database.js");

connectDB();

app.listen(process.env.PORT, () => {
    console.log(`Server running on Port: ${process.env.PORT}`);
})
