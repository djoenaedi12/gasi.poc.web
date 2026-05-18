import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormCheckbox } from "@/components/molecules/form-checkbox";
import { FormDatePicker } from "@/components/molecules/form-date-picker";
import { FormDateTimePicker } from "@/components/molecules/form-datetime-picker";
import { FormInput } from "@/components/molecules/form-input";
import { FormLookupPicker } from "@/components/molecules/form-lookup-picker";
import { FormMultiSelect } from "@/components/molecules/form-multi-select";
import { FormRadioGroup } from "@/components/molecules/form-radio-group";
import { FormSelect } from "@/components/molecules/form-select";
import { FormTimePicker } from "@/components/molecules/form-time-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    employeeSchema,
    type EmployeeFormData,
} from "../schemas/employeeSchema";

type EmployeeFormProps = {
    defaultValues?: EmployeeFormData;
    submitLabel: string;
    onCancel: () => void;
    onSubmit: (data: EmployeeFormData) => void;
};

const departmentOptions = [
    { label: "Engineering", value: "Engineering" },
    { label: "People", value: "People" },
    { label: "Finance", value: "Finance" },
    { label: "Sales", value: "Sales" },
    { label: "Operations", value: "Operations" },
];

const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
    { label: "On Leave", value: "On Leave" },
];

export function EmployeeForm({
    defaultValues,
    submitLabel,
    onCancel,
    onSubmit,
}: EmployeeFormProps) {
    const form = useForm<EmployeeFormData>({
        resolver: zodResolver(employeeSchema),
        defaultValues: defaultValues ?? {
            name: "",
            email: "",
            department: "",
            position: "",
            status: "Active",
            joinDate: "",
            interviewAt: "",
            checkInTime: "",
            skills: [],
            active: true,
            employmentType: "permanent",
        },
    });

    return (
        <Card>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <FormInput
                            form={form}
                            name="name"
                            label="Full name"
                            placeholder="e.g. Sarah Wijaya"
                        />

                        <FormInput
                            form={form}
                            name="email"
                            label="Email"
                            type="email"
                            placeholder="name@company.com"
                        />

                        <FormLookupPicker
                            form={form}
                            name="department"
                            label="Department"
                            options={departmentOptions}
                            placeholder="Pilih department"
                            required
                        />

                        <FormInput
                            form={form}
                            name="position"
                            label="Position"
                            placeholder="e.g. Frontend Engineer"
                        />

                        <FormSelect
                            form={form}
                            name="status"
                            label="Status"
                            options={statusOptions}
                        />

                        <FormDatePicker
                            form={form}
                            name="joinDate"
                            label="Join date"
                            displayFormat="dd MMM yyyy"
                        />

                        <FormDateTimePicker
                            form={form}
                            name="interviewAt"
                            label="Interview schedule"
                            displayFormat="dd/MM/yyyy HH:mm"
                            minuteStep={15}
                        />

                        <FormTimePicker
                            form={form}
                            name="checkInTime"
                            label="Check-in time"
                            minuteStep={15}
                            minTime="08:00"
                            maxTime="17:00"
                        />

                        <FormMultiSelect
                            form={form}
                            name="skills"
                            label="Skills"
                            options={[
                                { label: "React", value: "react" },
                                { label: "TypeScript", value: "typescript" },
                                { label: "Node.js", value: "nodejs" },
                            ]}
                            placeholder="Select skills"
                            maxSelected={5}
                        />

                        <FormCheckbox
                            form={form}
                            name="active"
                            label="Active"
                            description="User ini aktif dan dapat digunakan."
                        />

                        <FormRadioGroup
                            form={form}
                            name="employmentType"
                            label="Employment Type"
                            options={[
                                {
                                    label: "Permanent",
                                    value: "permanent",
                                },
                                {
                                    label: "Contract",
                                    value: "contract",
                                },
                                {
                                    label: "Internship",
                                    value: "internship",
                                },
                            ]}
                        />
                    </div>

                    <div className="flex justify-end gap-2 border-t pt-5">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit">{submitLabel}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
