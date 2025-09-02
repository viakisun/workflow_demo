import { NodeParamSchema } from "@/types/core";
import { FormRow } from "../primitives/FormRow";
import { Input } from "../primitives/Input";
import { Select } from "../primitives/Select";

type ParamEditorProps = {
  paramsSchema: Record<string, NodeParamSchema>;
  params: Record<string, any>;
  onParamChange: (param: string, value: any) => void;
};

export default function ParamEditor({
  paramsSchema,
  params,
  onParamChange,
}: ParamEditorProps) {
  return (
    <div className="space-y-4">
      {Object.entries(paramsSchema).map(([key, schema]) => {
        const value = params[key] ?? schema.default;

        return (
          <FormRow key={key} label={schema.description ?? key}>
            {schema.type === "string" && (
              <Input
                type="text"
                value={value}
                onChange={(e) => onParamChange(key, e.target.value)}
              />
            )}
            {schema.type === "number" && (
              <Input
                type="number"
                value={value}
                onChange={(e) => onParamChange(key, Number(e.target.value))}
              />
            )}
            {schema.type === "boolean" && (
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => onParamChange(key, e.target.checked)}
              />
            )}
            {schema.enum && (
              <Select
                value={value}
                onChange={(e) => onParamChange(key, e.target.value)}
              >
                {schema.enum.map((option) => (
                  <option key={String(option)} value={String(option)}>
                    {String(option)}
                  </option>
                ))}
              </Select>
            )}
          </FormRow>
        );
      })}
    </div>
  );
}
