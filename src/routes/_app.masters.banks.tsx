import { createFileRoute } from "@tanstack/react-router";
import { MasterCrud } from "@/features/masters/master-crud";

export const Route = createFileRoute("/_app/masters/banks")({
  component: () => (
    <MasterCrud
      title="Banks"
      table="banks"
      fields={[
        { name: "bank_name", label: "Bank Name", required: true },
        { name: "account_no", label: "Account No" },
        { name: "swift_code", label: "SWIFT Code" },
        { name: "ifsc_code", label: "IFSC Code" },
        { name: "branch", label: "Branch" },
        { name: "ad_code", label: "AD Code" },
      ]}
      displayColumns={["bank_name", "account_no", "swift_code", "ifsc_code", "branch"]}
      columnLabels={{ bank_name: "Bank", account_no: "Account", swift_code: "SWIFT", ifsc_code: "IFSC", branch: "Branch" }}
    />
  ),
});
