import { z } from "zod";

export const employeeSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Format email tidak valid"),
    department: z.string().min(1, "Pilih department"),
    position: z.string().min(2, "Position minimal 2 karakter"),
    status: z.enum(["Active", "Inactive", "On Leave"]),
    joinDate: z.string().min(1, "Tanggal bergabung wajib diisi"),
    interviewAt: z.string().min(1, "Tanggal wawancara wajib diisi"),
    checkInTime: z.string().min(1, "Waktu check-in wajib diisi"),
    skills: z.array(z.string()).optional(),
    active: z.boolean().optional(),
    employmentType: z.string().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
