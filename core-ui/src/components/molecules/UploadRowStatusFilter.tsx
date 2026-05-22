import type { UploadRowStatus } from "../../types/dataUpload.types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

type UploadRowStatusFilterProps = {
    value: UploadRowStatus | "ALL";
    onChange: (value: UploadRowStatus | "ALL") => void;
};

export function UploadRowStatusFilter({ value, onChange }: UploadRowStatusFilterProps) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as UploadRowStatus | "ALL")}>
            <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL">All status</SelectItem>
                <SelectItem value="RAW">RAW</SelectItem>
                <SelectItem value="VALID">VALID</SelectItem>
                <SelectItem value="INVALID">INVALID</SelectItem>
                <SelectItem value="COMMITTED">COMMITTED</SelectItem>
            </SelectContent>
        </Select>
    );
}
