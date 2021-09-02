const mysql = require('mysql2');
const cTable = require('console.table');
const inquirer = require('inquirer');
require('dotenv').config();

const con = mysql.createConnection(
    {
        user: 'root',
        password: process.env.passWord,
        database: 'employeeTracker',
    },
    console.log('Connected.')
);

const getEmployeeIdFromName = async (employeeName) => {
    const name = employeeName.split(" ");
    query = "SELECT id FROM employee WHERE ((first_name = ?) AND (last_name = ?));";
    const [rows, field] = await con.promise().query(query, name);
    const id = rows[0].id;
    return id;
}

const getRoleIdFromRoleName = async (roleName) => {
    const role = roleName;
    query = "SELECT id FROM role WHERE title = ?;";
    const [rows, field] = await con.promise().query(query, role);
    const id = rows[0].id;
    return id;
}

const getEmployeeName = async () => {
    const empArray = [];
    let query = "SELECT CONCAT(first_name,' ',last_name) AS name FROM employee;"
    const [rows, field] = await con.promise().query(query);
    for (let i = 0; i < rows.length; i++) {
        empArray.push(rows[i].name);
    }
    return empArray;
};

const getEmployeeRole = async () => {
    const roleArray = [];
    let query = "SELECT title FROM role;"
    const [rows, field] = await con.promise().query(query);
    for (let i = 0; i < rows.length; i++) {
        roleArray.push(rows[i].title);
    }
    return roleArray;
};

const mainMenu = [
    'Display All Departments',
    'Display All Roles',
    'Display All Employees',
    'Add A Department',
    'Add A Role',
    'Add An Employee',
    'Update An Employee Role',
]

const promptUser = () => {
    return inquirer.prompt(
        [
            {
                type: 'list',
                name: 'choice',
                message: 'What would you like to do?',
                choices: mainMenu
            }
        ]
    )
        .then(answer => selectCase(answer))
        .catch(error => console.log(error));
}

const addDepartment = () => {
    return inquirer.prompt(
        [
            {
                type: 'input',
                name: 'name',
                message: 'Enter the name of department you would like to add:'
            }
        ]
    );
}

const addRole = () => {
    const deptArray = [];
    con.query(`SELECT * FROM department;`, (err, rows) => {
        for (let i = 0; i < rows.length; i++) {
            deptArray.push(rows[i].name);
        }
    });
    return inquirer.prompt(
        [
            {
                type: 'input',
                name: 'name',
                message: 'Enter the name of role to add:'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the salary:'
            },
            {
                type: 'list',
                name: 'department',
                message: 'Select a department:',
                choices: deptArray
            }
        ]
    );
}

getDepartmentId = (answer) => {
    con.promise().query(`SELECT * FROM department WHERE name=?`, answer.department)
        .then(([rows, fields]) => {
            const dept = rows[0].id;
            const params = [answer.name, answer.salary, dept]
            con.query(`INSERT INTO role (title,salary,department_id) VALUES (?,?,?);`, params, (err, rows) => {
                promptUser();
            });
        });
};

const addEmployee = async () => {

    const roleArray = await getEmployeeRole();
    const managerArray = await getEmployeeName();

    return inquirer.prompt(
        [
            {
                type: 'input',
                name: 'first_name',
                message: "Enter the first name of employee:"
            },
            {
                type: 'input',
                name: 'last_name',
                message: "Enter the last name of employee:"
            },
            {
                type: 'list',
                name: 'role',
                message: 'Select a role:',
                choices: roleArray
            },
            {
                type: 'list',
                name: 'manager',
                message: 'Select a manager:',
                choices: managerArray
            }
        ]
    );
}

const getEmployee = async (answer) => {
    const role = await getRoleIdFromRoleName(answer.role);
    const manager = await getEmployeeIdFromName(answer.manager);
    const params = [answer.first_name, answer.last_name, role, manager];
    let query = `INSERT INTO employee (first_name,last_name,role_id, manager_id) VALUES (?,?,?,?);`;
    con.query(query, params);
    promptUser();
};

const updateRole = async () => {
    const emp = await getEmployeeName();
    const role = await getEmployeeRole();
    return inquirer
        .prompt([
            {
                type: "list",
                name: "emp",
                message: "Select the employee to update:",
                choices: emp
            },
            {
                type: "list",
                name: "role",
                message: "Select the employee role.",
                choices: role
            }
        ]).
        then(answer => {
            updateNewRole(answer);
        })
}

const updateNewRole = async (answer) => {

    const employeeIdToUpdate = await getEmployeeIdFromName(answer.emp);
    const getRoleToUpdate = await getRoleIdFromRoleName(answer.role);
    let params = [getRoleToUpdate, employeeIdToUpdate];
    let query = `UPDATE employee SET role_id = ? WHERE id = ?;`;
    con.query(query, params);
    promptUser();
}

const selectCase = (answer) => {
    let choice = answer.choice;
    switch (choice) {
        case "Display All Departments":
            let deptQuery = `SELECT id,department.name as department FROM department;`;
            con.query(deptQuery, (err, rows) => {
                console.table(rows);
                promptUser();
            });
            break;

        case "Display All Roles":
            let roleQuery = `SELECT role.id as 'role id', role.title as 'job title', department.name as department, role.salary
            FROM role
            INNER JOIN department ON department.id =role.department_id;`
            con.query(roleQuery, (err, rows) => {
                console.table(rows);
                promptUser();
            });
            break;

        case "Display All Employees":
            let employeeQuery = `SELECT employee.id,employee.first_name,employee.last_name,role.title as 'job title',department.name as department, role.salary, CONCAT(e.first_name,' ',e.last_name) AS manager
                            FROM employee 
                            INNER JOIN role 
                            ON role.id = employee.role_id 
                            INNER JOIN department on department.id = role.department_id  
                            LEFT JOIN employee e ON employee.manager_id=e.id ORDER BY id;`;
            con.query(employeeQuery, (err, rows) => {
                console.table(rows);
                promptUser();
            });
            break;

        case "Add A Department":
            addDepartment().then(answer => {
                con.query(`INSERT INTO department (name) VALUES (?);`, answer.name, (err, rows) => {
                    promptUser();
                });
            });
            break;

        case "Add A Role":
            addRole().then(answer => {
                getDepartmentId(answer);
            });
            break;

        case "Add An Employee":
            addEmployee().then(answer => {
                getEmployee(answer);
            })
            break;

        case "Update An Employee Role":
            updateRole();
            break;

        case "Display All Employees By Manager":
            console.log("Display All Employees By Manager");
            break;

        case "Remove Employee":
            console.log("Remove Employee");
            break;

        case "Update Employee Manager":
            console.log("Update Employee Manager");
            break;

        case "Remove Role":
            console.log("Remove Role");
            break;

        default:
            console.log("Not Valid");
    }
}

promptUser();

