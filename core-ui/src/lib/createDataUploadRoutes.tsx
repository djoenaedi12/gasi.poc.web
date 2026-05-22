import type { Action, RouteDefinition } from "@gasi/core-api";
import { Actions } from "@gasi/core-api";
import type { QueryKey } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { DataUploadHistoryPage } from "../components/organisms/DataUploadHistoryPage";
import { DataUploadPage } from "../components/organisms/DataUploadPage";
import { DataUploadRowDetailPage } from "../components/organisms/DataUploadRowDetailPage";
import { DataUploadRowsPage } from "../components/organisms/DataUploadRowsPage";

export type DataUploadRoutesConfig = {
    resource: string;
    basePath: string;
    entityLabel: string;
    invalidateQueryKey?: QueryKey;
    templateFileName?: string;
    templateUrl?: string;
    uploadAction?: Action;
    readAction?: Action;
};

type UploadNavState = { context?: "upload" | "history"; backTo?: string } | null;

export function createDataUploadRoutes(config: DataUploadRoutesConfig): RouteDefinition[] {
    const {
        resource,
        basePath,
        entityLabel,
        invalidateQueryKey,
        templateFileName = `${resource}-template.csv`,
        templateUrl,
        uploadAction = Actions.UPLOAD,
        readAction = Actions.READ,
    } = config;

    const uploadPath = `${basePath}/upload`;
    const historyPath = `${uploadPath}/history`;

    function UploadPage() {
        const navigate = useNavigate();
        const [searchParams] = useSearchParams();
        const uploadId = searchParams.get("uploadId") ?? undefined;

        return (
            <DataUploadPage
                resource={resource}
                templateFileName={templateFileName}
                templateUrl={templateUrl}
                onBack={() => navigate(basePath)}
                initialUploadId={uploadId}
                onHistory={() => navigate(historyPath)}
                onViewRow={(uid, rowId) =>
                    navigate(`${historyPath}/${uid}/rows/${rowId}`, {
                        state: { context: "upload", backTo: `${uploadPath}?uploadId=${uid}` } satisfies UploadNavState,
                    })
                }
                invalidateQueryKey={invalidateQueryKey}
            />
        );
    }

    function HistoryPage() {
        const navigate = useNavigate();

        return (
            <DataUploadHistoryPage
                resource={resource}
                breadcrumbs={[
                    { label: entityLabel, href: basePath },
                    { label: "Upload", href: uploadPath },
                    { label: "History" },
                ]}
                onViewUpload={(uploadId) => navigate(`${historyPath}/${uploadId}`)}
                onContinueUpload={(uploadId) => navigate(`${uploadPath}?uploadId=${uploadId}`)}
            />
        );
    }

    function RowsPage() {
        const navigate = useNavigate();
        const { uploadId } = useParams();

        if (!uploadId) return null;

        return (
            <DataUploadRowsPage
                resource={resource}
                uploadId={uploadId}
                breadcrumbs={[
                    { label: entityLabel, href: basePath },
                    { label: "Upload", href: uploadPath },
                    { label: "History", href: historyPath },
                    { label: uploadId },
                ]}
                onViewRow={(rowId) =>
                    navigate(`${historyPath}/${uploadId}/rows/${rowId}`, {
                        state: { context: "history", backTo: `${historyPath}/${uploadId}` } satisfies UploadNavState,
                    })
                }
            />
        );
    }

    function RowDetailPage() {
        const location = useLocation();
        const { uploadId, rowId } = useParams();
        const state = location.state as UploadNavState;

        if (!uploadId || !rowId) return null;

        const breadcrumbs =
            state?.context === "upload"
                ? [
                    { label: entityLabel, href: basePath },
                    { label: "Upload", href: state.backTo },
                    { label: rowId },
                ]
                : [
                    { label: entityLabel, href: basePath },
                    { label: "Upload", href: uploadPath },
                    { label: "History", href: historyPath },
                    { label: uploadId, href: `${historyPath}/${uploadId}` },
                    { label: rowId },
                ];

        return (
            <DataUploadRowDetailPage
                resource={resource}
                uploadId={uploadId}
                rowId={rowId}
                breadcrumbs={breadcrumbs}
            />
        );
    }

    UploadPage.displayName = `${resource}UploadPage`;
    HistoryPage.displayName = `${resource}UploadHistoryPage`;
    RowsPage.displayName = `${resource}UploadRowsPage`;
    RowDetailPage.displayName = `${resource}UploadRowDetailPage`;

    return [
        { path: uploadPath, component: UploadPage, resource, action: uploadAction },
        { path: historyPath, component: HistoryPage, resource, action: readAction },
        { path: `${historyPath}/:uploadId`, component: RowsPage, resource, action: readAction },
        { path: `${historyPath}/:uploadId/rows/:rowId`, component: RowDetailPage, resource, action: readAction },
    ];
}
