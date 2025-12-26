import { getUserPermissionsAction } from "@/src/actions/permissions";
import { SidebarClient, SidebarItem } from "./SidebarClient";
import { getUserPermissions } from "@/src/db/_internal/permissions";

export async function SidebarServer() {
  const getUserPermissionsActionResult = await getUserPermissionsAction();

  if (!getUserPermissionsActionResult.success) {
    return null;
  }
  const userPermissions = getUserPermissionsActionResult.result;

  // All available nav items, regardless of user permissions
  const navItems: (SidebarItem & { requiredPermission: string })[] = [
    {
      href: "/book-keeping",
      label: "Book Keeping",
      iconName: "Album",
      requiredPermission: "use_app_book_keeping",
    },
    {
      href: "/gym",
      label: "Gym",
      iconName: "Dumbbell",
      requiredPermission: "use_app_gym",
    },
    {
      href: "/car",
      label: "Car",
      iconName: "Car",
      requiredPermission: "use_app_car",
    },
    {
      href: "/wanikani",
      label: "Wanikani",
      iconName: "Languages",
      requiredPermission: "use_app_wanikani",
    },
    {
      href: "/obsidian",
      label: "Obsidian",
      iconName: "Pencil",
      requiredPermission: "use_app_obsidian",
    },
    {
      href: "/git",
      label: "Git",
      iconName: "GitFork",
      requiredPermission: "use_app_git",
    },
    {
      href: "/admin",
      label: "Admin Panel",
      iconName: "UserStar",
      requiredPermission: "use_app_admin",
    },
  ];

  // Filter available nav items by user permissions
  const navItemsForUser: SidebarItem[] = navItems
    .filter((item) =>
      userPermissions.some(
        (permission) => permission.permissionName === item.requiredPermission
      )
    )
    .map(({ requiredPermission, ...clientItem }) => clientItem); // remove requiredPermission

  return <SidebarClient navItems={navItemsForUser} />;
}
