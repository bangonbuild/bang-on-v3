/** Standard bottom padding clearing the bottom nav + 20px content gap + safe area */
export const NAV_PB = 'pb-[calc(var(--bottom-nav-height)+20px+env(safe-area-inset-bottom))]'

/** Drawer fixed height */
export const DRAWER_HEIGHT = 'h-[85vh]'

/** Back button aligned to 16px content edge */
export const BACK_BTN = 'flex h-12 w-6 shrink-0 items-center justify-start'

/** Desktop sidebar width */
export const DESKTOP_SIDEBAR_WIDTH = '240px'

/** Bottom padding on desktop (no bottom nav) */
export const DESKTOP_PB = 'pb-8'

/** Padding for scrollable content inside bottom drawers (clears bottom nav) */
export const DRAWER_SCROLL_PB =
  'pb-[calc(var(--bottom-nav-height)+20px+env(safe-area-inset-bottom))]'

/** Bottom offset for fixed elements above the nav */
export const NAV_BOTTOM = 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom))'

/** Space below the Nudge input bar (nav + FAB lip + home indicator) */
export const NUDGE_INPUT_BOTTOM =
  'calc(var(--bottom-nav-height) + 12px + env(safe-area-inset-bottom, 0px))'
