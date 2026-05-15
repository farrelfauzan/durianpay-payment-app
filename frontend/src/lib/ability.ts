import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from '@casl/ability'

type Actions = 'view' | 'manage' | 'export'
type Subjects = 'Payment' | 'Dashboard' | 'Analytics' | 'all'

export type AppAbility = MongoAbility<[Actions, Subjects]>

export function defineAbilityFor(role: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  switch (role) {
    case 'operation':
      can('view', 'Payment')
      can('view', 'Dashboard')
      can('view', 'Analytics')
      can('export', 'Payment')
      break
    case 'cs':
      can('view', 'Payment')
      can('view', 'Dashboard')
      break
    default:
      break
  }

  return build()
}
