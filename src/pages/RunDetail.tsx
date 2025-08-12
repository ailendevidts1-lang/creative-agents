import { useParams } from "react-router-dom";

export default function RunDetail() {
  const { id } = useParams();
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold">Run Details</h1>
      <p className="text-muted-foreground">Run ID: {id}</p>
    </main>
  );
}
