import { expect, test } from 'vitest'
import { getErrorStack } from './error'

test('keeps native failure details inside a wrapped error', () => {
    const error = new Error('Update failed', {
        cause: { code: 'RESOLVE_FAILED', message: 'Requires Discord >=352.2' },
    })
    expect(getErrorStack(error)).toContain('[RESOLVE_FAILED] Requires Discord >=352.2')
})

test('handles circular causes without overflowing', () => {
    const error = new Error('cycle')
    error.cause = error
    expect(getErrorStack(error)).toContain('[Circular error cause]')
})

test('preserves primitive causes', () => {
    expect(getErrorStack(new Error('failure', { cause: 0 }))).toContain('Caused by: 0')
})
