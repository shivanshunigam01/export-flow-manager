import { createFileRoute } from "@tanstack/react-router";
import { MasterCrud } from "@/features/masters/master-crud";

export const Route = createFileRoute("/_app/masters/customers")({
  component: () => (
    <MasterCrud
      title="Customers"
      description="Foreign buyers and consignees"
      table="customers"
      fields={[
        { name: "name", label: "Customer Name", required: true },
        { name: "contact_person", label: "Contact Person" },
        { name: "email", label: "Email" },
        { name: "phone", label: "Phone" },
        { name: "city", label: "City" },
        { name: "address", label: "Address", type: "textarea" },
        { name: "country", label: "Country" },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
      displayColumns={["name", "contact_person", "city", "email", "phone"]}
      columnLabels={{ name: "Name", contact_person: "Contact", city: "City", email: "Email", phone: "Phone" }}
    />
  ),
});
