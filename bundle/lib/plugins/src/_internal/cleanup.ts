/** Runs every cleanup, collecting synchronous and asynchronous failures. */
export async function settleCleanups(cleanups: readonly (() => unknown)[]) {
    const results = await Promise.allSettled(
        cleanups.map(cleanup => Promise.resolve().then(cleanup)),
    )
    return results.flatMap(result =>
        result.status === 'rejected' ? [result.reason] : [],
    )
}
