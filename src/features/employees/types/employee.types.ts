export type EmployeeStatus = "Active" | "Inactive" | "On Leave";

export type Employee = {
    id: string;
    name: string;
    email: string;
    department: string;
    position: string;
    status: EmployeeStatus;
    joinDate: string;
    interviewAt: string;
    checkInTime: string;
};

export type EmployeeParams = {
    search?: string;
    department?: string;
    status?: EmployeeStatus | "all";
    page?: number;
    pageSize?: number;
};
