const app = require("./app.js");

app.listen(process.env.PORT, () => {
    console.log(`Server running on Port: ${process.env.PORT}`);
})
