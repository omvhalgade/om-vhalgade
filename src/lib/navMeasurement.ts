/**
 * Dynamically measures the actual rendered height and bottom boundary
 * of the navigation elements in the DOM, and synchronizes CSS variables:
 * --nav-rendered-height and --nav-clearance.
 */
export function syncNavRenderedHeight(): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 74;
  }

  const floatNav = document.getElementById('float-nav');
  const primaryNav = document.getElementById('primary-nav');

  let bottom = 0;

  if (floatNav) {
    const rect = floatNav.getBoundingClientRect();
    // In CSS floatNav has top: 20px
    const top = rect.top > 0 ? rect.top : 20;
    const height = rect.height > 0 ? rect.height : 48;
    bottom = Math.max(bottom, top + height);
  }

  if (primaryNav) {
    const pRect = primaryNav.getBoundingClientRect();
    if (pRect.bottom > bottom) {
      bottom = pRect.bottom;
    }
  }

  // Ensure minimum baseline of 74px if DOM hasn't rendered yet
  const measuredNavBottom = bottom > 0 ? Math.ceil(bottom) : 74;
  // Clearance adds a generous 20px buffer so section titles never touch or hide behind nav
  const clearance = measuredNavBottom + 20;

  document.documentElement.style.setProperty('--nav-rendered-height', `${measuredNavBottom}px`);
  document.documentElement.style.setProperty('--nav-clearance', `${clearance}px`);

  return measuredNavBottom;
}
