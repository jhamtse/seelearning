import PersonForm from "@/components/PersonForm";
import { createPersonAction } from "@/app/people/actions";

export default function NewPersonPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Add a person</h1>
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <PersonForm action={createPersonAction} submitLabel="Add person" />
      </div>
    </div>
  );
}
