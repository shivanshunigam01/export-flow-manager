import { createFileRoute } from "@tanstack/react-router";
import { MasterCrud } from "@/features/masters/master-crud";

export const Route = createFileRoute("/_app/masters/suppliers")({
  component: () => (
    <MasterCrud
      title="Suppliers"
      description="Manufacturers and factory details used on Annexure"
      table="suppliers"
      fields={[
        { name: "name", label: "Supplier Name", required: true },
        { name: "contact_person", label: "Contact" },
        { name: "gst_no", label: "GSTIN" },
        { name: "phone", label: "Phone" },
        { name: "address", label: "Address", type: "textarea" },
        { name: "factory_address", label: "Factory Address", type: "textarea" },
      ]}
      displayColumns={["name", "gst_no", "contact_person", "phone"]}
      columnLabels={{ name: "Name", gst_no: "GSTIN", contact_person: "Contact", phone: "Phone" }}
    />
  ),
});
