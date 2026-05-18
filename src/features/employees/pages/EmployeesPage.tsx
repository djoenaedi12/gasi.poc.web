import { Download, Plus, Trash2, Upload } from "lucide-react";
import { useMemo } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { DataTable } from "@/components/datatable/data-table";
import { PageHeader } from "@/components/molecules/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { EmployeeTableToolbar } from "../components/EmployeeTableToolbar";
import { getEmployeeColumns } from "../components/employee-columns";
import { deleteEmployee, getEmployees } from "../data/employee-storage";

export function EmployeesPage() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState(() => getEmployees());
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("all");
    const [status, setStatus] = useState("all");

    const handleDelete = (id: string) => {
        deleteEmployee(id);
        setEmployees(getEmployees());
    };

    const handleBulkDelete = (ids: string[]) => {
        ids.forEach((id) => deleteEmployee(id));
        setEmployees(getEmployees());
    };

    const columns = useMemo(
        () => getEmployeeColumns({ onDelete: handleDelete }),
        [],
    );

    const departments = useMemo(
        () => Array.from(new Set(employees.map((employee) => employee.department))),
        [employees],
    );

    const statuses = useMemo(
        () => Array.from(new Set(employees.map((employee) => employee.status))),
        [employees],
    );

    const filteredEmployees = useMemo(
        () =>
            employees.filter((employee) => {
                const matchesSearch =
                    employee.name.toLowerCase().includes(search.toLowerCase()) ||
                    employee.email.toLowerCase().includes(search.toLowerCase());
                const matchesDepartment =
                    department === "all" || employee.department === department;
                const matchesStatus = status === "all" || employee.status === status;

                return matchesSearch && matchesDepartment && matchesStatus;
            }),
        [department, employees, search, status],
    );

    const resetFilters = () => {
        setDepartment("all");
        setStatus("all");
    };

    const handleExport = () => {
        console.log("Export employees", filteredEmployees);
    };

    const handleBulkUpload = () => {
        console.log("Open bulk upload flow");
    };

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Employees"
                description="Kelola data karyawan, status pekerjaan, dan informasi organisasi."
            />

            <Card>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={filteredEmployees}
                        searchPlaceholder="Search employees..."
                        emptyTitle="No employees found"
                        emptyDescription="You haven’t added any employees yet. Create a single employee or use bulk upload to import multiple employees at once."
                        emptyAction={
                            <>
                                <Button
                                    type="button"
                                    onClick={() => navigate("/employees/create")}
                                >
                                    <Plus className="size-4" />
                                    Create Employee
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBulkUpload}
                                >
                                    <Upload className="size-4" />
                                    Bulk Upload
                                </Button>
                            </>
                        }
                        searchValue={search}
                        onSearchChange={setSearch}
                        toolbar={
                            <EmployeeTableToolbar
                                department={department}
                                status={status}
                                departments={departments}
                                statuses={statuses}
                                onDepartmentChange={setDepartment}
                                onStatusChange={setStatus}
                                onReset={resetFilters}
                            />
                        }
                        actions={[
                            {
                                label: "Export",
                                icon: <Download className="size-4" />,
                                onClick: handleExport,
                                variant: "outline",
                            },
                        ]}
                        enableColumnSettings
                        columnPreferenceKey="employees-table"
                        primaryAction={{
                            label: "Add Employee",
                            icon: <Plus className="size-4" />,
                            items: [
                                {
                                    label: "Add single employee",
                                    icon: <Plus className="size-4" />,
                                    onClick: () => navigate("/employees/create"),
                                },
                                {
                                    label: "Bulk upload",
                                    icon: <Upload className="size-4" />,
                                    onClick: handleBulkUpload,
                                },
                            ],
                        }}
                        enableRowSelection
                        getRowId={(employee) => employee.id}
                        renderSelectedActions={(selectedEmployees) => (
                            <ConfirmDialog
                                destructive
                                title="Delete selected employees?"
                                description={`You are about to delete ${selectedEmployees.length} employee(s). This action cannot be undone.`}
                                confirmLabel="Delete"
                                trigger={
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                    >
                                        <Trash2 className="size-4" />
                                        Delete selected
                                    </Button>
                                }
                                onConfirm={() =>
                                    handleBulkDelete(
                                        selectedEmployees.map((employee) => employee.id),
                                    )
                                }
                            />
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
