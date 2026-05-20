import * as React from 'react';
import { Link, useLocation } from 'react-router';
import { LogOut, User, EllipsisVertical } from 'lucide-react';
import { useAppStore } from '@gasi/core-starter';

import { Avatar, AvatarFallback }        from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
         DropdownMenuItem, DropdownMenuLabel,
         DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
         SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
         SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton,
         SidebarMenuSubItem, SidebarRail, useSidebar } from '../ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronRight } from 'lucide-react';

// ─── Nav Menu ────────────────────────────────────────────────────────────────

function NavMenu() {
  const { session } = useAppStore();
  const location    = useLocation();
  const menus       = session?.menus ?? [];

  if (!menus.length) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {menus.map((menu) => {
          const hasChildren = menu.children && menu.children.length > 0;
          const isActive    = location.pathname.startsWith(menu.path);

          if (hasChildren) {
            return (
              <Collapsible key={menu.code} defaultOpen={isActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger render={<SidebarMenuButton tooltip={menu.label} />}>
                    <span>{menu.label}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {menu.children!.map((child) => (
                        <SidebarMenuSubItem key={child.code}>
                          <SidebarMenuSubButton
                            render={<Link to={child.path} />}
                            isActive={location.pathname === child.path}
                          >
                            <span>{child.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          return (
            <SidebarMenuItem key={menu.code}>
              <SidebarMenuButton
                render={<Link to={menu.path} />}
                isActive={isActive}
                tooltip={menu.label}
              >
                <span>{menu.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

// ─── Nav User ─────────────────────────────────────────────────────────────────

function NavUser() {
  const { session, clearSession } = useAppStore();
  const { isMobile }              = useSidebar();
  const user                      = session?.user;

  if (!user) return null;

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    // Plugin auth akan handle actual logout (clear cookie di BE)
    // Di sini hanya clear session FE
    clearSession();
    window.location.href = '/login';
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.fullName}</span>
              <span className="truncate text-xs">{user.username}</span>
            </div>
            <EllipsisVertical className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.fullName}</span>
                    <span className="truncate text-xs">{user.username}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// ─── App Sidebar ──────────────────────────────────────────────────────────────

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader />
      <SidebarContent>
        <NavMenu />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
