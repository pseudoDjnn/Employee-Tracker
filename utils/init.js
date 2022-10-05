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
  const sql = `SELECT e.emp_id AS id, concat(e.first_name,' ', e.last_name) AS employee, e.role_title AS title, e.role_salary AS salary, e.department_name AS dept,
  CASE WHEN e.manager_id = e.emp_id THEN concat('N/A') ELSE concat(m.first_name, ' ', m.last_name) END AS manager FROM (SELECT * FROM employees LEFT JOIN emp_role ON employees.r_id = emp_role.role_id LEFT JOIN dept ON emp_role.department_id = dept.dept_id) AS e, employees m WHERE m.emp_id = e.manager_id`;
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

function vEmployDept() {
  const getDepartments = new Promise((resolve, reject) => {
    var departmentsArr = [];
    const sql = `SELECT department_name FROM dept`;
    db.query(sql, (err, rows) => {
      if (err) {
        console.log(err.message);
      }
      for (var i = 0; i < rows.length; i++) {
        departmentsArr.push(Object.values(rows[i])[0]);
      }
      resolve(departmentsArr);
    });
  });

  getDepartments.then((departmentsArr) => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "departmentId",
          message: "Choose the department of your role",
          choices: departmentsArr,
          filter: (deptIdInput) => {
            if (deptIdInput) {
              return departmentsArr.indexOf(deptIdInput);
            }
          },
        },
      ])
      .then(({ departmentId }) => {
        const sql = ` SELECT e.emp_id as id, concat(e.first_name,' ', e.last_name) AS employee, e.role_title AS title, e.role_salary AS salary, e.department_name AS dept, 
          CASE WHEN e.manager_id = e.emp_id THEN concat('N/A') ELSE concat(m.first_name, ' ', m.last_name) END AS manager 
          FROM (SELECT * FROM employees LEFT JOIN emp_role ON employees.r_id = emp_role.role_id LEFT JOIN dept ON emp_role.department_id = dept.dept_id) AS e, employees m 
          WHERE m.emp_id = e.manager_id
          AND dept_id = ? `;
        const query = [departmentId + 1];
        db.query(sql, query, (err, rows) => {
          if (err) {
            console.log(err.message);
          }
          console.table(rows);
          mainMenu();
        });
      });
  });
}

function aRole() {
  const grabDepartment = new Promise((resolve, reject) => {
    let deptArray = [];
    const sql = `SELECT department_name FROM dept`;
    db.query(sql, (err, rows) => {
      if (err) {
        console.log(err.message);
      }
      for (let i = 0; i < rows.length; i++) {
        deptArray.push(Object.values(rows[i])[0]);
      }
      resolve(deptArray);
    });
  });
  grabDepartment.then((deptArray) => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "departmentId",
          message: "Please select a department",
          choices: deptArray,
          filter: (idInput) => {
            if (idInput) {
              return deptArray.indexOf(idInput);
            }
          },
        },
        {
          type: "text",
          name: "titleOfRole",
          message: "Enter the role you wish to add:",
          validate: (titleInput) => {
            if (titleInput) {
              return true;
            } else {
              console.log(
                "You must enter a title for the role you wish to add."
              );
              return false;
            }
          },
        },
        {
          type: "number",
          name: "salaryInputId",
          message: "Enter the salary of the role you just entered:",
          validate: (salaryInput) => {
            if (!salaryInput || salaryInput === NaN) {
              console.log("");
              console.log("Please enter a valid numerical and do not format");
              return false;
            } else {
              return true;
            }
          },
          filter: (salaryInput) => {
            if (!salaryInput || salaryInput === NaN) {
              return "";
            } else {
              return salaryInput;
            }
          },
        },
      ])
      .then(({ departmentId, titleOfRole, salaryInputId }) => {
        const sql = `INSERT INTO emp_role (department_id, role_title, role_salary) VALUES (?,?,?)`;
        const query = [departmentId + 1, titleOfRole, salaryInputId];
        db.query(sql, query, (err, rows) => {
          if (err) {
            console.log(err.message);
          }
          console.log("");
          console.log("                         Success!");
          inquirer
            .prompt({
              type: "confirm",
              name: "result",
              message: "Is everthing correct?",
            })
            .then(({ result }) => {
              if (result) {
                console.log("");
                vRoles();
              } else mainMenu();
            });
        });
      });
  });
}

function aDept() {
  inquirer
    .prompt([
      {
        type: "text",
        name: "deptAdd",
        message: "Create a new department:",
      },
    ])
    .then(({ deptAdd }) => {
      const sql = `INSERT INTO dept (dept_name) VALUES (?)`;
      const query = [deptAdd];
      db.query(sql, query, (err, rows) => {
        if (err) {
          console.log(err.message);
        }
        console.log("");
        console.log("Wonderful!");
        inquirer
          .prompt({
            type: "confirm",
            name: "result",
            message: "Added result is shown.",
          })
          .then(({ result }) => {
            if (result) {
              console.log("");
              vDepts();
            } else {
              mainMenu();
            }
          });
      });
    });
}

function aEmployee() {
  const grabTheTitle = new Promise((resolve, reject) => {
    var titlesArr = [];
    const sql = `SELECT role_title FROM emp_role`;
    db.query(sql, (err, rows) => {
      if (err) {
        console.log(err.message);
      }
      for (var i = 0; i < rows.length; i++) {
        titlesArr.push(Object.values(rows[i])[0]);
      }
      resolve(titlesArr);
    });
  });

  const getActiveManagerList = new Promise((resolve, reject) => {
    var activeManagerArr = [];
    const sql = ` SELECT DISTINCT concat(m.first_name, ' ', m.last_name) 
                  AS manager FROM employees e, employees m 
                  WHERE m.emp_id = e.manager_id  `;
    db.query(sql, (err, rows) => {
      if (err) {
        console.log(err.message);
      }
      for (var i = 0; i < rows.length; i++) {
        activeManagerArr.push(Object.values(rows[i])[0]);
      }
      activeManagerArr.push("Show more");
      resolve(activeManagerArr);
    });
  });

  const getManagerList = new Promise((resolve, reject) => {
    var managerArr = [];
    const sql = ` SELECT concat(m.first_name, ' ', m.last_name) 
                  AS manager FROM employees m `;
    db.query(sql, (err, rows) => {
      if (err) {
        console.log(err.message);
      }
      for (var i = 0; i < rows.length; i++) {
        managerArr.push(Object.values(rows[i])[0]);
      }
      managerArr.push("Employee does not have a manager");
      resolve(managerArr);
    });
  });
  const getManIdList = new Promise((resolve, reject) => {
    var manIdArr = [];
    const sql = ` SELECT DISTINCT m.emp_id AS manager 
                  FROM employees e, employees m 
                  WHERE m.emp_id = e.manager_id `;
    db.query(sql, (err, rows) => {
      if (err) {
        console.log(err.message);
      }
      for (var i = 0; i < rows.length; i++) {
        manIdArr.push(Object.values(rows[i])[0]);
      }
      resolve(manIdArr);
    });
  });

  Promise.all([
    grabTheTitle,
    getActiveManagerList,
    getManagerList,
    getManIdList,
  ]).then(([titlesArr, activeManagerArr, managerArr, manIdArr]) => {
    inquirer
      .prompt([
        {
          type: "text",
          name: "firstname",
          message: "Employee First Name:",
          validate: (firstnameInput) => {
            if (firstnameInput) {
              return true;
            } else {
              console.log("Please enter a first name!");
              return false;
            }
          },
        },
        {
          type: "text",
          name: "lastname",
          message: "Employee Last Name:",
          validate: (lastnameInput) => {
            if (lastnameInput) {
              return true;
            } else {
              console.log("Please enter a last name!");
              return false;
            }
          },
        },
        {
          type: "list",
          name: "roleId",
          message: "Choose a role for the employee.",
          choices: titlesArr,
          filter: (roleIdInput) => {
            if (roleIdInput) {
              return titlesArr.indexOf(roleIdInput) + 1;
            }
          },
        },
        {
          type: "list",
          name: "managerID1",
          message: "Select name of manager",
          choices: activeManagerArr,
          filter: (managerID1Input) => {
            if (managerID1Input === "Show more") {
              return managerID1Input;
            } else {
              return activeManagerArr.indexOf(managerID1Input);
            }
          },
        },
        {
          type: "list",
          name: "managerID2",
          message: "Select name of manager",
          choices: managerArr,
          filter: (managerID2Input) => {
            if (managerID2Input === "Employee does not have a manager") {
              return managerID2Input;
            } else {
              return managerArr.indexOf(managerID2Input) + 1;
            }
          },
          when: ({ managerID1 }) => {
            if (isNaN(managerID1) === true) {
              return true;
            } else {
              return false;
            }
          },
        },
      ])
      .then(({ firstname, lastname, roleId, managerID1, managerID2 }) => {
        const getManId = () => {
          if (isNaN(managerID1)) {
            if (isNaN(managerID2)) {
              managerArr.push(firstname + " " + lastname);
              return managerArr.indexOf(firstname + " " + lastname);
            } else {
              return managerID2;
            }
          } else {
            return manIdArr[managerID1];
          }
        };
        const manId = getManId();
        const sql = `INSERT INTO employees (first_name, last_name, r_id, manager_id) VALUES (?,?,?,?)`;
        const query = [firstname, lastname, roleId, manId];
        db.query(sql, query, (err, rows) => {
          if (err) {
            console.log(err.message);
          } else {
            console.log("");
            console.log(`                                   Success!`);
            inquirer
              .prompt({
                type: "confirm",
                name: "results",
                message: "See results?",
              })
              .then(({ results }) => {
                if (results) {
                  console.log("");
                  vEmploy();
                } else {
                  mainMenu();
                }
              });
          }
        });
      });
  });
}

function updateEmploy() {
  const grabTheTitle = new Promise((resolve, reject) => {
    var titlesArr = [];
    const sql = `SELECT role_title FROM emp_role`;
    db.query(sql, (err, rows) => {
      if (err) {
        console.log(err.message);
      }
      for (var i = 0; i < rows.length; i++) {
        titlesArr.push(Object.values(rows[i])[0]); // same as in addRole()!
      }
      resolve(titlesArr);
    });
  });

  const grabTheEmployees = new Promise((resolve, reject) => {
    var employeesArr = [];
    const sql = `SELECT first_name, last_name FROM employees`;
    db.query(sql, (err, rows) => {
      if (err) {
        console.log(err.message);
      }
      for (var i = 0; i < rows.length; i++) {
        employeesArr.push(
          Object.values(rows[i])[0] + " " + Object.values(rows[i])[1]
        ); // same as in addRole()!
      }
      resolve(employeesArr);
    });
  });

  Promise.all([grabTheTitle, grabTheEmployees]).then(
    ([titlesArr, employeesArr]) => {
      inquirer
        .prompt([
          {
            type: "list",
            name: "employeeName",
            message: "Which employee would you like to update?",
            choices: employeesArr,
            filter: (employeeNameInput) => {
              if (employeeNameInput) {
                return employeesArr.indexOf(employeeNameInput);
              } //since the list will be ordered by id we can return the index and use that as e_id
            },
          },
          {
            type: "list",
            name: "employeeRole",
            message: "Select the new role for this employee.",
            choices: titlesArr,
            filter: (employeeRoleInput) => {
              if (employeeRoleInput) {
                return titlesArr.indexOf(employeeRoleInput);
              }
            },
          },
        ])
        .then(({ employeeName, employeeRole }) => {
          const sql = `UPDATE employees SET r_id = ? WHERE emp_id = ?`;
          const query = [employeeRole + 1, employeeName + 1];
          db.query(sql, query, (err, rows) => {
            if (err) {
              console.log(err.message);
            }
            console.log("");
            console.log(`             Success!`);
            inquirer
              .prompt({
                type: "confirm",
                name: "results",
                message: "Care to display the results?",
              })
              .then(({ results }) => {
                if (results) {
                  console.log("");
                  vEmploy();
                } else {
                  mainMenu();
                }
              });
          });
        });
    }
  );
}

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
