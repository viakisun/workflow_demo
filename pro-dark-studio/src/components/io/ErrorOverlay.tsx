import { Button } from "../primitives/Button";

type ErrorOverlayProps = {
  issues: string[];
  onClose: () => void;
};

export default function ErrorOverlay({ issues, onClose }: ErrorOverlayProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(issues.join("\n"));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-[720px] max-h-[70vh] flex flex-col rounded-2xl border border-stroke bg-panel-2">
        <div className="p-4 border-b border-stroke">
          <h2 className="text-lg font-semibold">Import Errors</h2>
          <p className="text-sm text-muted">
            The following issues were found in the imported file.
          </p>
        </div>
        <div className="p-4 overflow-auto">
          <ul className="text-sm font-mono space-y-1">
            {issues.map((s, i) => (
              <li key={i} className="text-red-400">
                <span className="text-red-600 mr-2">&bull;</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t border-stroke flex justify-end gap-2">
          <Button variant="secondary" onClick={handleCopy}>
            Copy issues
          </Button>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
