/**
 * Navigation helper for use outside React (e.g. API interceptors).
 * The root component sets this to router.navigate after mount.
 */
let _navigate: ((opts: { to: string }) => void) | null = null

export function setAppNavigate(fn: (opts: { to: string }) => void) {
  _navigate = fn
}

export function navigateToLogin() {
  if (_navigate) {
    _navigate({ to: '/login' })
  } else {
    window.location.href = '/login'
  }
}
