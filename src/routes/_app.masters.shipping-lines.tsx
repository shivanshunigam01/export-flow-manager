import { createFileRoute } from "@tanstack/react-router";
import { MasterCrud } from "@/features/masters/master-crud";

export const Route = createFileRoute("/_app/masters/shipping-lines")({
  component: () => (
    <MasterCrud
      title="Shipping Lines"
      table="shipping_lines"
      fields={[
        { name: "name", label: "Line Name", required: true },
        { name: "code", label: "Code" },
      ]}
      displayColumns={["name", "code"]}
      columnLabels={{ name: "Name", code: "Code" }}
    />
  ),
});
