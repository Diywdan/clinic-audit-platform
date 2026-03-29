import { AdminPanels } from "@/components/forms/admin-panels";
import { AppShell } from "@/components/layout/app-shell";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminData } from "@/lib/services/queries";

export default async function AdminPage() {
  const session = await requireAdmin();
  const data = await getAdminData();

  return (
    <AppShell
      title="Панель администрирования"
      subtitle="Управление клиниками, пользователями, проверками и экспортом"
      role={session.user.role}
    >
      <AdminPanels {...data} />
    </AppShell>
  );
}
