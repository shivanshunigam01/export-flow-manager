import { createFileRoute } from "@tanstack/react-router";
import { MasterCrud } from "@/features/masters/master-crud";

export const Route = createFileRoute("/_app/masters/ports")({
  component: () => (
    <MasterCrud
      title="Ports"
      table="ports"
      fields={[
        { name: "name", label: "Port Name", required: true },
        { name: "code", label: "Port Code" },
        { name: "country", label: "Country" },
        { name: "address", label: "Port address", type: "textarea" },
      ]}
      displayColumns={["name", "code", "country", "address", "port_type"]}
      columnLabels={{ name: "Name", code: "Code", country: "Country", address: "Address", port_type: "Type" }}
    />
  ),
});
