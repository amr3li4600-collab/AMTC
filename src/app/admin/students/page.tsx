import { StudentsView } from "@/components/StudentsView";
import { getStudents, getArchivedStudents } from "@/app/actions/studentActions";

export const dynamic = 'force-dynamic';

export default async function StudentsPage({ searchParams }: { searchParams: { view?: string } }) {
  const isArchivedView = searchParams.view === 'archived';
  const students = isArchivedView ? await getArchivedStudents() : await getStudents();

  return <StudentsView students={students} isArchivedView={isArchivedView} />;
}
