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
        { name: "brand_name", label: "Brand name" },
        { name: "image_url", label: "Product Image", type: "image" },
        { name: "description", label: "Description", type: "textarea" },
      ]}
      displayColumns={["image_url", "name", "brand_name", "hsn_code", "unit", "default_rate"]}
      columnLabels={{ image_url: "Image", name: "Product", brand_name: "Brand", hsn_code: "HSN", unit: "Unit", default_rate: "Rate" }}
    />
  ),
});
