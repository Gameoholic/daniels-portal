import "server-only";

import { getUserPermissionsAction } from "@/src/actions/permissions";
import { SidebarClient, SidebarItem } from "./SidebarClient";
import { Permission } from "@/src/db/_internal/per-table/permissions";

export async function SidebarServer() {
  const getUserPermissionsActionResult = await getUserPermissionsAction();

  if (!getUserPermissionsActionResult.success) {
    return null;
  }
  const userPermissions = getUserPermissionsActionResult.result;

  // All available nav items, regardless of user permissions
  const navItems: (SidebarItem & { requiredPermission: Permission })[] = [
    {
      href: "/book-keeping",
      label: "Book Keeping",
      iconName: "Album",
      requiredPermission: Permission.UseApp_BookKeeping,
    },
    {
      href: "/gym",
      label: "Gym",
      iconName: "Dumbbell",
      requiredPermission: Permission.UseApp_Gym,
    },
    {
      href: "/car",
      label: "Car",
      iconName: "Car",
      requiredPermission: Permission.UseApp_Car,
    },
    {
      href: "/wanikani",
      label: "Wanikani",
      iconName: "Languages",
      requiredPermission: Permission.UseApp_Wanikani,
    },
    {
      href: "/obsidian",
      label: "Obsidian",
      iconName: "Pencil",
      requiredPermission: Permission.UseApp_Obsidian,
    },
    {
      href: "/git",
      label: "Git",
      iconName: "GitFork",
      requiredPermission: Permission.UseApp_Git,
    },
    {
      href: "/admin",
      label: "Admin Panel",
      iconName: "UserStar",
      requiredPermission: Permission.UseApp_Admin,
    },
  ];

  // Filter available nav items by user permissions
  const navItemsForUser: SidebarItem[] = navItems
    .filter((item) =>
      userPermissions.some(
        (permission) => permission.name === item.requiredPermission
      )
    )
    .map(({ requiredPermission, ...clientItem }) => clientItem); // remove requiredPermission

  return <SidebarClient navItems={navItemsForUser} />;
}
