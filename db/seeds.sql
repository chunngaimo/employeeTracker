INSERT INTO department (name)
VALUES 
    ('Sales'),
    ('Engineering'),
    ('Finance'),
    ('Legal');

INSERT INTO role (title, salary, department_id)
VALUES
    ('Sales Lead',100000,1),
    ('Salesperson',80000,1),
    ('Lead Engineer', 150000,2),
    ('Software Engineer',120000,2),
    ('Accountant',125000,3),
    ('Legal Team Lead',250000,4),
    ('Lawyer',190000,4)
    ;

INSERT INTO employee (first_name,last_name,role_id,manager_id)
VALUES
    ('Johnny','Jones',1,3),
    ('Michael','Williams',2,1),
    ('Astrid','Miller',3,NULL),
    ('David','Johnson',4,3),
    ('Melissa','Brown',5,NULL),
    ('Sarah','Anderson',6,NULL),
    ('Andrew','Lee',7,6),
    ('Jason','Harris',3,2)
    ;