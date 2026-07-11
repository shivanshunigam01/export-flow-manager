import { createFileRoute } from "@tanstack/react-router";
import { MasterCrud } from "@/features/masters/master-crud";

export const Route = createFileRoute("/_app/masters/products")({
  component: () => (
    <MasterCrud
      title="Products"
      description="Exportable goods with HSN codes"
      table="products"
      fields={[
        { name: "name", label: "Product Name", required: true },
        { name: "hsn_code", label: "HSN Code" },
        { name: "unit", label: "Unit (SQM, PCS, SET…)" },
        { name: "default_rate", label: "Default Rate", type: "number" },
        { name: "description", label: "Description", type: "textarea" },
      ]}
      displayColumns={["name", "hsn_code", "unit", "default_rate"]}
      columnLabels={{ name: "Product", hsn_code: "HSN", unit: "Unit", default_rate: "Rate" }}
    />
  ),
});
