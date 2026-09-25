import { getStudent } from "@/app/actions/studentActions";
import { EditStudentView } from "@/components/EditStudentView";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  const student = await getStudent(params.id);

  if (!student) {
    notFound();
  }

  return <EditStudentView student={student} />;
}
