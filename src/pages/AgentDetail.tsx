import { useParams } from "react-router-dom";

export default function AgentDetail() {
  const { id } = useParams();
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold">Agent Details</h1>
      <p className="text-muted-foreground">Agent ID: {id}</p>
    </main>
  );
}
