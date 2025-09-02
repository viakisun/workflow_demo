import { useWorkspaceStore } from "@/store/workspace";
import { safeParse } from "@/schema/validate";
import { ZWorkflow, ZRulePack, ZRegistryEntry } from "@/schema/workflow";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { RefreshCcw } from "lucide-react";

function ValidationBadge({
  ok,
  count,
}: {
  ok: boolean;
  count?: number;
}) {
  return (
    <Badge color={ok ? "green" : "yellow"}>
      {ok ? "Valid" : `Errors: ${count ?? ""}`}
    </Badge>
  );
}

function Section({ title, data, schema }) {
  const validation = data ? safeParse(schema, data) : null;
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        {validation && (
          <ValidationBadge
            ok={validation.ok}
            count={!validation.ok ? validation.issues.length : 0}
          />
        )}
      </div>
      <pre className="mt-1 bg-panel border border-stroke rounded p-2 overflow-auto max-h-48 text-xs">
        {JSON.stringify(data ?? {}, null, 2)}
      </pre>
    </section>
  );
}

export default function JsonPreview() {
  const { workflow, rules, registry, setDocs } = useWorkspaceStore();

  const handleRevalidate = () => {
    // This will trigger a re-render and re-validation
    setDocs({ workflow, rules, registry });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="secondary" onClick={handleRevalidate}>
          <RefreshCcw className="size-4 mr-2" />
          Run lint
        </Button>
      </div>
      <Section title="Workflow" data={workflow} schema={ZWorkflow} />
      <Section title="Registry" data={registry} schema={ZRegistryEntry.array()} />
      <Section title="Rules" data={rules} schema={ZRulePack} />
    </div>
  );
}
