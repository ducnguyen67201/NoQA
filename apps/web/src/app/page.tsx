import { getPublicCaller } from "@/lib/trpc-server";

export default async function Home() {
  const caller = getPublicCaller();
  const projects = await caller.project.list();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">NoQa</h1>
      <section>
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects yet.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((project) => (
              <li key={project.id} className="p-4 border rounded">
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-gray-500">{project.slug}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
