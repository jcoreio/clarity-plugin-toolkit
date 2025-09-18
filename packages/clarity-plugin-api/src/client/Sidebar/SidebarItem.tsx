import * as React from 'react'

export type SidebarItemProps = React.HTMLAttributes<HTMLElement> & {
  button?: boolean
  disabled?: boolean
  children: React.ReactNode
  classes?: {
    /**
     * Alias for `className`
     */
    root?: string
    /**
     * CSS class to apply when the `to` path is currently active
     */
    active?: string
  }
  /**
   * link path within the app (clicking the `<SidebarItem>` will navigate to this
   * path without reloading the page)
   * In contrast, the `href` property is for external links and will cause a page load
   */
  to?:
    | string
    | {
        pathname?: string
        search?: string
        hash?: string
        key?: string
      }
  /**
   * external link path (clicking the `<SidebarItem>` will navigate to this path
   * causing a page load)
   * In contrast, the `to` property is for internal links and will not cause a page load
   */
  href?: string
  hrefLang?: string
  target?: React.HTMLAttributeAnchorTarget
  download?: any
  media?: string
  ping?: string
  type?: string
  referrerPolicy?: React.HTMLAttributeReferrerPolicy
}

export const SidebarItem: React.ComponentType<SidebarItemProps> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function SidebarItem(props: SidebarItemProps): React.ReactElement {
    throw new Error(
      'this is a stub for the implementation that will be provided by clarity'
    )
  }
