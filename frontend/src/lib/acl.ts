export const ACL = {
  view: {
    Payment: { I: 'view', a: 'Payment' },
    Dashboard: { I: 'view', a: 'Dashboard' },
    Analytics: { I: 'view', a: 'Analytics' },
  },
  export: {
    Payment: { I: 'export', a: 'Payment' },
  },
} as const
