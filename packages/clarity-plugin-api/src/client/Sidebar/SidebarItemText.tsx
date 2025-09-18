import * as React from 'react'

export type SidebarItemTextProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * The main content element.
   */
  primary?: React.ReactNode
  /**
   * The secondary content element
   */
  secondary?: React.ReactNode
  /**
   * Alias for the `primary` prop.
   */
  children?: React.ReactNode
}

export const SidebarItemText: React.ComponentType<SidebarItemTextProps> =
  function SidebarItemText(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    props: SidebarItemTextProps
  ): React.ReactElement {
    throw new Error(
      'this is a stub for the implementation that will be provided by clarity'
    )
  }
