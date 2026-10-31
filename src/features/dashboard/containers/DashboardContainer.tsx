import { DrawerExamples } from "@/components/examples/drawer-examples"
import { PageTitle } from "@/components/page-title"
import { placeholderUser } from "@/config/app"
import { DashboardOverview } from "../components/DashboardOverview"

export default function DashboardContainer() {
  return (
    <>
      <PageTitle title="Overview" />
      <DashboardOverview userName={placeholderUser.name} />
      <DrawerExamples />
    </>
  )
}
