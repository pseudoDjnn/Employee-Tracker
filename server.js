const db = require("./db/connect");
const init = require("./utils/init");

db.connect((err) => {
  if (err) throw err;
  console.log("Databse is connected.");
  setTimeout(() => {
    init();
  }, 500);
});
