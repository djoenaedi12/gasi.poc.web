// Types
export type * from './types/api.types';

// Lib
export { cn } from './lib/utils';
export { api } from './lib/axios';
export { appToast } from './lib/toast';
export { applyApiFieldErrors, getApiFieldErrors } from './lib/formErrors';
export { createBaseService } from './lib/baseService';
export { createBaseHooks } from './lib/baseHooks';
export { createResourceRoutes } from './lib/createResourceRoutes';
export type { ResourceRoutesConfig } from './lib/createResourceRoutes';
export { formatDate, formatDateTime, daysSince } from './lib/date';
export { generateTimeSlots, getCurrentTimeInRange } from './lib/time';
export { changeLanguage, getLocale, registerTranslations, setLocale, supportedLocales, translate, useI18n } from './lib/i18n';
export type { SupportedLocale, TranslationParams } from './lib/i18n/translations';
export type { Translate } from './lib/i18n';

// Hooks
export { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
export type { QueryKey, UseQueryResult } from '@tanstack/react-query';
export { useIsMobile } from './hooks/useMobile';

// UI Components
export {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogMedia, AlertDialogOverlay,
    AlertDialogPortal, AlertDialogTitle,
    AlertDialogTrigger
} from './components/ui/alert-dialog';
export { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
export { Badge, badgeVariants } from './components/ui/badge';
export { Button, buttonVariants } from './components/ui/button';
export { Calendar } from './components/ui/calendar';
export {
    Card, CardContent, CardDescription,
    CardFooter, CardHeader, CardTitle
} from './components/ui/card';
export { Checkbox } from './components/ui/checkbox';
export {
    Collapsible, CollapsibleContent,
    CollapsibleTrigger
} from './components/ui/collapsible';
export {
    Dialog, DialogClose, DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
    DialogTrigger
} from './components/ui/dialog';
export {
    DropdownMenu, DropdownMenuCheckboxItem,
    DropdownMenuContent, DropdownMenuGroup,
    DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuPortal, DropdownMenuRadioGroup,
    DropdownMenuRadioItem, DropdownMenuSeparator,
    DropdownMenuShortcut, DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from './components/ui/dropdown-menu';
export { Empty } from './components/ui/empty';
export { Field } from './components/ui/field';
export { Input } from './components/ui/input';
export { InputGroup } from './components/ui/input-group';
export { Label } from './components/ui/label';
export {
    Popover, PopoverContent,
    PopoverTrigger
} from './components/ui/popover';
export { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
export { ScrollArea, ScrollBar } from './components/ui/scroll-area';
export {
    Select, SelectContent, SelectGroup,
    SelectItem, SelectLabel, SelectSeparator,
    SelectTrigger, SelectValue
} from './components/ui/select';
export { Separator } from './components/ui/separator';
export {
    Sheet, SheetClose, SheetContent,
    SheetDescription, SheetFooter,
    SheetHeader, SheetTitle,
    SheetTrigger
} from './components/ui/sheet';
export {
    Sidebar, SidebarContent, SidebarFooter,
    SidebarGroup, SidebarGroupAction,
    SidebarGroupContent, SidebarGroupLabel,
    SidebarHeader, SidebarInput, SidebarInset,
    SidebarMenu, SidebarMenuAction,
    SidebarMenuBadge, SidebarMenuButton,
    SidebarMenuItem, SidebarMenuSkeleton,
    SidebarMenuSub, SidebarMenuSubButton,
    SidebarMenuSubItem, SidebarProvider,
    SidebarRail, SidebarSeparator,
    SidebarTrigger, useSidebar
} from './components/ui/sidebar';
export { Skeleton } from './components/ui/skeleton';
export { Toaster } from './components/ui/sonner';
export { Spinner } from './components/ui/spinner';
export { Switch } from './components/ui/switch';
export {
    Table, TableBody, TableCaption,
    TableCell, TableFooter, TableHead,
    TableHeader, TableRow
} from './components/ui/table';
export {
    Tabs, TabsContent, TabsList,
    TabsTrigger
} from './components/ui/tabs';
export { Textarea } from './components/ui/textarea';
export {
    Tooltip, TooltipContent,
    TooltipProvider, TooltipTrigger
} from './components/ui/tooltip';

// Molecules
export { AppToaster } from './components/molecules/AppToaster';
export { CardTabs, CardTabsList, CardTabsTrigger, CardTabsContent } from './components/molecules/CardTabs';
export { ConfirmDialog } from './components/molecules/ConfirmDialog';
export { FormArrayTable } from './components/molecules/FormArrayTable';
export { FormButton } from './components/molecules/FormButton';
export { FormCheckbox } from './components/molecules/FormCheckbox';
export { FormDatePicker } from './components/molecules/FormDatePicker';
export { FormDateTimePicker } from './components/molecules/FormDateTimePicker';
export { FormFieldError } from './components/molecules/FormFieldError';
export { FormFieldLabel } from './components/molecules/FormFieldLabel';
export { FormInput } from './components/molecules/FormInput';
export { FormLookupPicker } from './components/molecules/FormLookupPicker';
export { FormMultiSelect } from './components/molecules/FormMultiSelect';
export { FormRadioGroup } from './components/molecules/FormRadioGroup';
export { FormSelect } from './components/molecules/FormSelect';
export { FormSwitch } from './components/molecules/FormSwitch';
export { FormTextarea } from './components/molecules/FormTextarea';
export { FormTimePicker } from './components/molecules/FormTimePicker';
export { LookupPicker } from './components/molecules/LookupPicker';
export type { LookupDisplayColumn, LookupOption, LookupPreset } from './components/molecules/LookupPicker';
export { PageHeader } from './components/molecules/PageHeader';
export { Stepper } from './components/molecules/Stepper';
export { StepperWizard } from './components/molecules/StepperWizard';

// Organisms
export { AppHeader } from './components/organisms/AppHeader';
export { AppNotificationMenu } from './components/organisms/AppNotificationMenu';
export { AppSidebar } from './components/organisms/AppSidebar';
export { ResourceListPage } from './components/organisms/ResourceListPage';
export type { ResourceListPageProps } from './components/organisms/ResourceListPage';

// Datatable
export { DataTable, ServerDataTable } from './components/datatable/DataTable';
export type { DataTableProps, ServerDataTableProps } from './components/datatable/DataTable';
export { DataTableBulkDeleteAction } from './components/datatable/DataTableBulkDeleteAction';
export { exportVisibleTableRowsToCsv } from './components/datatable/dataTableExport';
export { DataTableRowActions, getDataTableRowActionsColumn } from './components/datatable/DataTableRowActions';
export { DataTableSortableHeader } from './components/datatable/DataTableSortableHeader';
export { buildDataTableFilter, buildSearchFilter, buildSearchRequest, combineFilters } from './components/datatable/dataTableUtils';
export type {
    BuildSearchRequestOptions,
    ColumnVisibilityState,
    DataTableColumn,
    DataTableColumnMeta,
} from './components/datatable/dataTableUtils';
export type {
    DataTableAction,
    DataTableEmptyState,
    DataTableFilterChip,
    DataTableFilterControl,
    DataTableFilterField,
} from './components/datatable/dataTableTypes';
