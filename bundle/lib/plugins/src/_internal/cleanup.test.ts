import { expect, test, vi } from 'vitest'
import { settleCleanups } from './cleanup'

test('runs remaining cleanups after synchronous and asynchronous failures', async () => {
    const sync = new Error('sync')
    const asyncError = new Error('async')
    const release = vi.fn()
    const errors = await settleCleanups([
        () => { throw sync },
        async () => { throw asyncError },
        release,
    ])
    expect(release).toHaveBeenCalledOnce()
    expect(errors).toEqual([sync, asyncError])
})

test('waits for asynchronous cleanup before completing', async () => {
    let finish!: () => void
    let done = false
    const pending = settleCleanups([() => new Promise<void>(resolve => { finish = resolve })])
        .then(result => { done = true; return result })
    await Promise.resolve()
    expect(done).toBe(false)
    finish()
    expect(await pending).toEqual([])
})
