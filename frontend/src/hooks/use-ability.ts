import { createContext, useContext } from 'react'
import { createContextualCan } from '@casl/react'
import type { AppAbility } from '#/lib/ability'
import { defineAbilityFor } from '#/lib/ability'

export const AbilityContext = createContext<AppAbility>(defineAbilityFor(''))

export const Can = createContextualCan(AbilityContext.Consumer)

export function useAbility() {
  return useContext(AbilityContext)
}
