import * as React from 'react'
import type { SidebarSectionHeaderProps } from './SidebarSectionHeader'

export type SidebarSectionProps = {
  classes?: {
    root?: string
    title?: string
  }
  title: string
  expanded?: boolean
  secondaryActions?: React.ReactNode
  loadingChildren?: boolean
  onHeaderClick?: React.MouseEventHandler<HTMLElement>
  headerProps?: Partial<SidebarSectionHeaderProps>
  children?: React.ReactNode
}

export const SidebarSection: React.ComponentType<SidebarSectionProps> =
  function SidebarSection(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    props: SidebarSectionProps
  ): React.ReactElement {
    throw new Error('not implemented')
  }
