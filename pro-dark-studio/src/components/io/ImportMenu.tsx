import { forwardRef } from "react";
import { Button } from "../primitives/Button";
import { Upload } from "lucide-react";

type ImportMenuProps = {
  onImportExample: () => void;
  onUploadWorkflow: (file: File) => void;
  onUploadRules: (file: File) => void;
  onUploadRegistry: (file: File) => void;
};

const ImportMenu = forwardRef<HTMLDivElement, ImportMenuProps>(
  (
    {
      onImportExample,
      onUploadWorkflow,
      onUploadRules,
      onUploadRegistry,
    },
    ref
  ) => {
    const handleFileChange =
      (handler: (file: File) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          handler(file);
        }
      };

    return (
      <div
        ref={ref}
        className="absolute top-full right-0 mt-2 w-56 rounded-lg bg-panel-2 border border-stroke shadow-lg"
      >
        <div className="p-2">
          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={onImportExample}
          >
            Open example
          </Button>
          <div className="my-2 border-t border-stroke" />
          <label className="w-full">
            <span className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-panel border border-stroke text-text hover:bg-panel-2 w-full justify-start flex items-center cursor-pointer">
              Upload Workflow
            </span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange(onUploadWorkflow)}
            />
          </label>
          <label className="w-full mt-1">
            <span className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-panel border border-stroke text-text hover:bg-panel-2 w-full justify-start flex items-center cursor-pointer">
              Upload Rules
            </span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange(onUploadRules)}
            />
          </label>
          <label className="w-full mt-1">
            <span className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-panel border border-stroke text-text hover:bg-panel-2 w-full justify-start flex items-center cursor-pointer">
              Upload Registry
            </span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange(onUploadRegistry)}
            />
          </label>
        </div>
      </div>
    );
  }
);

ImportMenu.displayName = "ImportMenu";
export default ImportMenu;
