export type ResourceCustom = object;

const resourceCustomRegistry = new Map<string, ResourceCustom>();
const emptyResourceCustom: ResourceCustom = {};

function normalizeResourceName(resource: string): string {
    return resource.trim();
}

export function registerResourceCustom<TCustom extends ResourceCustom>(
    resource: string,
    custom: TCustom,
): TCustom {
    const key = normalizeResourceName(resource);

    if (!key) {
        throw new Error("resource is required");
    }

    resourceCustomRegistry.set(key, custom);
    return custom;
}

export function getResourceCustom<TCustom extends ResourceCustom = ResourceCustom>(
    resource: string,
): Partial<TCustom> {
    const key = normalizeResourceName(resource);
    return (resourceCustomRegistry.get(key) ?? emptyResourceCustom) as Partial<TCustom>;
}

export function hasResourceCustom(resource: string): boolean {
    return resourceCustomRegistry.has(normalizeResourceName(resource));
}

export function clearResourceCustom(resource: string): void {
    resourceCustomRegistry.delete(normalizeResourceName(resource));
}

export function clearResourceCustoms(): void {
    resourceCustomRegistry.clear();
}
