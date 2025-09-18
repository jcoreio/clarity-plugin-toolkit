import * as React from 'react'
import type { SidebarItemProps } from './SidebarItem'

export type SidebarSectionHeaderProps = SidebarItemProps & {
  classes?: {
    root?: string
    title?: string
  }
  title: string
  expanded?: boolean
  secondaryActions?: React.ReactNode
  loading?: boolean
}

export const SidebarSectionHeader: React.ComponentType<SidebarSectionHeaderProps> =
  function SidebarSectionHeader(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    props: SidebarSectionHeaderProps
  ): React.ReactElement {
    throw new Error(
      'this is a stub for the implementation that will be provided by clarity'
    )
  }
