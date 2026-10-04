import { getPaginatedExpiringDocuments } from "@/app/actions/studentActions";
import { AlertsView } from "@/components/AlertsView";

interface AlertsPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    docType?: "ALL" | "PASSPORT" | "CEMPN";
    status?: "ALL" | "EXPIRED" | "EXPIRING_SOON";
    search?: string;
  };
}

export default async function AlertsPage({ searchParams }: AlertsPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const limit = searchParams.limit ? parseInt(searchParams.limit, 10) : 10;
  const docType = searchParams.docType || "ALL";
  const status = searchParams.status || "ALL";
  const search = searchParams.search || "";

  const result = await getPaginatedExpiringDocuments({
    page,
    limit,
    docType,
    status,
    search,
  });

  return (
    <AlertsView
      result={result}
      docType={docType}
      status={status}
      search={search}
      limit={limit}
    />
  );
}
