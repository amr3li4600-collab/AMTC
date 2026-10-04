import { getDashboardStats, getRecentStudents } from "@/app/actions/studentActions";
import { DashboardView } from "@/components/DashboardView";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const recentStudents = await getRecentStudents();

  return <DashboardView stats={stats} recentStudents={recentStudents} />;
}
