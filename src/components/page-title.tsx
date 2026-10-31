import { appConfig } from "@/config/app"

interface PageTitleProps {
  title: string
}

// React hoists <title> into <head>, so any page can set the tab title.
export function PageTitle({ title }: PageTitleProps) {
  return <title>{`${title} · ${appConfig.name}`}</title>
}
