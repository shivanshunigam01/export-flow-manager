import { createFileRoute } from "@tanstack/react-router";
import { MasterCrud } from "@/features/masters/master-crud";

export const Route = createFileRoute("/_app/masters/countries")({
  component: () => (
    <MasterCrud
      title="Countries"
      table="countries"
      fields={[
        { name: "name", label: "Country Name", required: true },
        { name: "code", label: "ISO Code" },
      ]}
      displayColumns={["name", "code"]}
      columnLabels={{ name: "Name", code: "Code" }}
    />
  ),
});
