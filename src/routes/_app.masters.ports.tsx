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
        { name: "port_type", label: "Type (sea/air/ICD)" },
      ]}
      displayColumns={["name", "code", "port_type"]}
      columnLabels={{ name: "Name", code: "Code", port_type: "Type" }}
    />
  ),
});
