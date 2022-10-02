const db = require("../db/connect");
const consoleTable = require("console.table");
const inquirer = require("inquirer");

function init() {
  console.log("");
  console.log(`
  ***********************************
  *                                 *
  *         Employee Tracker        *
  *                                 *
  ***********************************
  `);
  setTimeout(() => {
    mainMenu();
  }, 1000);
}

function mainMenu() {
  console.log("");
  inquirer
    .prompt({
      type: "list",
      name: "homePage",
      message: "Please slecect a choice.",
      choices: [
        "View our departments",
        "View all roles",
        "List all employees",
        "List employees by department",
        "Add role",
        "Add department",
        "Add employee",
        "Update an exsisting employee",
        "Exit",
      ],
    })
    .then(({ home }) => {
      if (home === "View our departments") {
        vDepts();
      } else if (home === "View all roles") {
        vRoles();
      } else if (home === "List all employees") {
        vEmploy();
      } else if (home === "List employees by department") {
        vEmployDept();
      } else if (home === "Add role") {
        aRole();
      } else if (home === "Add department") {
        aDept();
      } else if (home === "Add employee") {
        aEmploy();
      } else if (home === "Update an exsisting employee") {
        updateEmploy();
      } else if (home === "Exit") {
        initEnd();
      }
    });
}

function vDepts() {
  const sql = `SELECT dept_id AS id, dept_name AS name FROM dept`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err.message);
    }
    console.log("");
    console.table(rows);
    setTimeout(() => {
      mainMenu();
    }, 750);
  });
}

function initEnd() {
  consoleTable.log("");
  consoleTable.table("Thank you for using this application.");
  setTimeout(() => {
    console.log("");
    console.log("              Goodbye");
  }, 800);
  setTimeout(() => {
    process.exit(1);
  }, 1500);
}

module.exports = init;
