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
      name: "home",
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
        aEmployee();
      } else if (home === "Update an exsisting employee") {
        updateEmploy();
      } else if (home === "Exit") {
        endInit();
      }
    });
}

function vDepts() {
  const sql = `SELECT dept_id AS id, department_name AS name FROM dept`;
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

function vRoles() {
  const sql = `SELECT role_id AS id, role_title AS title, department_name AS name, role_salary AS salary FROM emp_role
  LEFT JOIN dept ON emp_role.department_id = dept.dept_id`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err.message);
    }
    console.log("");
    console.table(rows);
    setTimeout(() => {
      mainMenu();
    }, 800);
  });
}

function vEmploy() {
  const sql = `SELECT e.emp_id AS id, concat(e.first_name,' ', e.last_name) AS employee, e.role_title AS title, e.role_salary AS salary, e.dept_name AS dept,
  CASE WHEN e.manager_id = e.emp_id THEN concat('N/A') ELSE concat(u.first_name, ' ', u.last_name) END AS manager,
  FROM (SELECT * FROM employess LEFT JOIN roles ON employees.role_id = roles.r_id LEFT JOIN dept ON roles.dept_id = dept.dept_id) AS e, employees u WHERE u.e_id = e.manager_id`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err.message);
    }
    console.table(rows);
    setTimeout(() => {
      mainMenu();
    }, 800);
  });
}

function vEmployDept() {}

function aRole() {}

function aDept() {}

function aEmployee() {}

function updateEmploy() {}

function endInit() {
  console.log("");
  console.log("Thank you for using this application.");
  setTimeout(() => {
    console.log("");
    console.log("                             Goodbye.");
  }, 800);
  setTimeout(() => {
    process.exit(1);
  }, 1500);
}

module.exports = init;
