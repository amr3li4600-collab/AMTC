import { AdminShell } from "@/components/AdminShell";
import { LanguageProvider } from "@/context/LanguageContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <AdminShell>{children}</AdminShell>
    </LanguageProvider>
  );
}
