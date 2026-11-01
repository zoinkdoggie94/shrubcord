import { expect, test, vi } from 'vitest'
const native = vi.hoisted(() => ({ sync: vi.fn(), async: vi.fn() }))
vi.mock('@valenced/modules/native', () => ({
    callNativeMethod: native.async,
    callNativeMethodSync: native.sync,
}))
import { callPluginSystemMethod, callPluginSystemMethodSync } from './native'

test('preserves legacy native string errors', async () => {
    native.async.mockResolvedValue({ error: 'No cached index; refresh it first' })
    await expect(callPluginSystemMethod('valenced.plugins.repos.list', []))
        .rejects.toThrow('No cached index; refresh it first')
})

test('preserves structured native error codes', () => {
    native.sync.mockReturnValue({ error: { code: 'NOT_FOUND', message: 'Missing plugin' } })
    expect(() => callPluginSystemMethodSync('valenced.plugins.list', []))
        .toThrow(expect.objectContaining({ code: 'NOT_FOUND', message: 'Missing plugin' }))
})

test('rejects malformed native envelopes', async () => {
    native.async.mockResolvedValue(null)
    await expect(callPluginSystemMethod('valenced.plugins.repos.list', []))
        .rejects.toThrow('Malformed plugin system response')
})
