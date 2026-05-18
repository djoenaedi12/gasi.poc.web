import type { Employee } from "../types/employee.types";
import type { EmployeeFormData } from "../schemas/employeeSchema";

const STORAGE_KEY = "demo.employees";

const seedEmployees: Employee[] = [
    {
        id: "emp-001",
        name: "Junjun Junaedi",
        email: "junjun@company.com",
        department: "Engineering",
        position: "Frontend Engineer",
        status: "Active",
        joinDate: "2024-01-15",
        interviewAt: "2024-06-20T10:00:00.000Z",
        checkInTime: "09:00",
    },
    {
        id: "emp-002",
        name: "Sarah Wijaya",
        email: "sarah@company.com",
        department: "People",
        position: "HR Manager",
        status: "Active",
        joinDate: "2023-08-21",
        interviewAt: "2024-06-22T14:30:00.000Z",
        checkInTime: "08:30",
    },
    {
        id: "emp-003",
        name: "Raka Pratama",
        email: "raka@company.com",
        department: "Finance",
        position: "Payroll Specialist",
        status: "Inactive",
        joinDate: "2022-11-03",
        interviewAt: "2024-06-25T09:00:00.000Z",
        checkInTime: "09:15",
    },
];

function readStorage(): Employee[] {
    const rawData = localStorage.getItem(STORAGE_KEY);

    if (!rawData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEmployees));
        return seedEmployees;
    }

    try {
        return JSON.parse(rawData) as Employee[];
    } catch {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEmployees));
        return seedEmployees;
    }
}

function writeStorage(employees: Employee[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

export function getEmployees() {
    return readStorage();
}

export function getEmployeeById(id: string) {
    return readStorage().find((employee) => employee.id === id) ?? null;
}

export function createEmployee(data: EmployeeFormData) {
    const employees = readStorage();
    const employee: Employee = {
        id: crypto.randomUUID(),
        ...data,
    };

    writeStorage([employee, ...employees]);
    return employee;
}

export function updateEmployee(id: string, data: EmployeeFormData) {
    const employees = readStorage();
    const updatedEmployees = employees.map((employee) =>
        employee.id === id ? { ...employee, ...data } : employee,
    );

    writeStorage(updatedEmployees);
    return getEmployeeById(id);
}

export function deleteEmployee(id: string) {
    const employees = readStorage();
    writeStorage(employees.filter((employee) => employee.id !== id));
}
