import { beforeEach, expect, test, vi } from 'vitest'

const call = vi.hoisted(() => vi.fn())
vi.mock('@valenced/discord/common/utils', () => ({ TypedEventEmitter: class {} }))
vi.mock('@valenced/modules/native', () => ({ registerJSMethod: vi.fn() }))
vi.mock('./native', () => ({ callPluginSystemMethod: call }))
import { updatePlugins } from './repositories'

beforeEach(() => call.mockReset())

test('finishes each install before resolving the next plugin and deduplicates IDs', async () => {
    const events: string[] = []
    call.mockImplementation(async (method: string, args: unknown[]) => {
        const id = method.endsWith('planInstall') ? args[0] : (args[0] as { id: string }).id
        events.push(method.split('.').at(-1) + ':' + id)
        await Promise.resolve()
        return method.endsWith('planInstall')
            ? { id }
            : { installed: [id], pending: [], skipped: [] }
    })
    expect(await updatePlugins(['a', 'b', 'a'])).toEqual({
        installed: ['a', 'b'], pending: [], errors: [],
    })
    expect(events).toEqual(['planInstall:a', 'install:a', 'planInstall:b', 'install:b'])
})

test('keeps native errors and continues with remaining plugins', async () => {
    const failure = new Error('network')
    call.mockImplementation(async (method: string, args: unknown[]) => {
        if (method.endsWith('planInstall')) {
            if (args[0] === 'a') throw failure
            return { id: args[0] }
        }
        return { installed: [], pending: ['b'], skipped: [] }
    })
    expect(await updatePlugins(['a', 'b'])).toEqual({
        installed: [], pending: ['b'], errors: [{ id: 'a', error: failure }],
    })
})

test('does not call native methods for an empty selection', async () => {
    await updatePlugins([])
    expect(call).not.toHaveBeenCalled()
})
