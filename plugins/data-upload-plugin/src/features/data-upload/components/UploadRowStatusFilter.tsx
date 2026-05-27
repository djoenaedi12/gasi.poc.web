import type { UploadRowStatus } from "../types/dataUpload.types";
import { useI18n } from "@gasi/core-ui";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@gasi/core-ui";

type UploadRowStatusFilterProps = {
    value: UploadRowStatus | "ALL";
    onChange: (value: UploadRowStatus | "ALL") => void;
};

export function UploadRowStatusFilter({ value, onChange }: UploadRowStatusFilterProps) {
    const { t } = useI18n();

    return (
        <Select value={value} onValueChange={(v) => onChange(v as UploadRowStatus | "ALL")}>
            <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t("dataUpload.fields.status")} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL">{t("dataUpload.filters.allStatuses")}</SelectItem>
                <SelectItem value="RAW">{t("dataUpload.status.raw")}</SelectItem>
                <SelectItem value="VALID">{t("dataUpload.status.valid")}</SelectItem>
                <SelectItem value="INVALID">{t("dataUpload.status.invalid")}</SelectItem>
                <SelectItem value="COMMITTED">{t("dataUpload.status.committed")}</SelectItem>
            </SelectContent>
        </Select>
    );
}
