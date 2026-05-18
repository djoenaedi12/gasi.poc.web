import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import { PageHeader } from "@/components/molecules/page-header";
import { EmployeeForm } from "../components/EmployeeForm";
import {
    createEmployee,
    getEmployeeById,
    updateEmployee,
} from "../data/employee-storage";
import type { EmployeeFormData } from "../schemas/employeeSchema";

type EmployeeFormPageProps = {
    mode: "create" | "edit";
};

export function EmployeeFormPage({ mode }: EmployeeFormPageProps) {
    const navigate = useNavigate();
    const params = useParams();
    const employee = useMemo(
        () => (params.id ? getEmployeeById(params.id) : null),
        [params.id],
    );

    const isEditMode = mode === "edit";

    if (isEditMode && !employee) {
        return <Navigate to="/employees" replace />;
    }

    const handleSubmit = (data: EmployeeFormData) => {
        if (isEditMode && employee) {
            updateEmployee(employee.id, data);
        } else {
            createEmployee(data);
        }

        navigate("/employees");
    };

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title={isEditMode ? "Edit Employee" : "Create Employee"}
                description={
                    isEditMode
                        ? "Update employee profile and employment information."
                        : "Add a new employee profile to this workspace."
                }
            />

            <EmployeeForm
                defaultValues={employee ?? undefined}
                submitLabel={isEditMode ? "Save changes" : "Create employee"}
                onCancel={() => navigate("/employees")}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
