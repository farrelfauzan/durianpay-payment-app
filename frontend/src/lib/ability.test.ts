import { describe, expect, it } from 'vitest'
import { defineAbilityFor } from './ability'

describe('defineAbilityFor', () => {
  describe('operation role', () => {
    const ability = defineAbilityFor('operation')

    it('can view Payment', () => {
      expect(ability.can('view', 'Payment')).toBe(true)
    })

    it('can view Dashboard', () => {
      expect(ability.can('view', 'Dashboard')).toBe(true)
    })

    it('can view Analytics', () => {
      expect(ability.can('view', 'Analytics')).toBe(true)
    })

    it('can export Payment', () => {
      expect(ability.can('export', 'Payment')).toBe(true)
    })
  })

  describe('cs role', () => {
    const ability = defineAbilityFor('cs')

    it('can view Payment', () => {
      expect(ability.can('view', 'Payment')).toBe(true)
    })

    it('can view Dashboard', () => {
      expect(ability.can('view', 'Dashboard')).toBe(true)
    })

    it('cannot view Analytics', () => {
      expect(ability.can('view', 'Analytics')).toBe(false)
    })

    it('cannot export Payment', () => {
      expect(ability.can('export', 'Payment')).toBe(false)
    })
  })

  describe('unknown role', () => {
    const ability = defineAbilityFor('')

    it('cannot view Payment', () => {
      expect(ability.can('view', 'Payment')).toBe(false)
    })

    it('cannot view Dashboard', () => {
      expect(ability.can('view', 'Dashboard')).toBe(false)
    })

    it('cannot export Payment', () => {
      expect(ability.can('export', 'Payment')).toBe(false)
    })
  })
})
