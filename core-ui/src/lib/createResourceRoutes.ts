import type { Action, RouteDefinition } from "@gasi/core-api";
import { Actions } from "@gasi/core-api";
import type { ComponentType } from "react";

export type ResourceRoutesConfig = {
    resource: string;
    basePath: string;
    entityLabel: string;
    list: ComponentType;
    detail: ComponentType;
    create?: ComponentType;
    edit?: ComponentType;
    readAction?: Action;
    createAction?: Action;
    updateAction?: Action;
};

export function createResourceRoutes({
    resource,
    basePath,
    entityLabel,
    list,
    detail,
    create,
    edit,
    readAction = Actions.READ,
    createAction = Actions.CREATE,
    updateAction = Actions.UPDATE,
}: ResourceRoutesConfig): RouteDefinition[] {
    const routes: RouteDefinition[] = [
        {
            path: basePath,
            component: list,
            resource,
            action: readAction,
            title: `${entityLabel}`,
        },
    ];

    if (create) {
        routes.push({
            path: `${basePath}/create`,
            component: create,
            resource,
            action: createAction,
            title: `Create ${entityLabel}`,
        });
    }

    routes.push({
        path: `${basePath}/:id`,
        component: detail,
        resource,
        action: readAction,
        title: `${entityLabel} Detail`,
    });

    if (edit) {
        routes.push({
            path: `${basePath}/:id/edit`,
            component: edit,
            resource,
            action: updateAction,
            title: `Edit ${entityLabel}`,
        });
    }

    return routes;
}
