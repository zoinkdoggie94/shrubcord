export function getErrorStack(e: unknown, seen = new Set<unknown>()): string {
    if (typeof e === 'object' && e !== null) {
        if (seen.has(e)) return '[Circular error cause]'
        seen.add(e)
    }
    if (e instanceof Error) {
        const stack = e.stack ?? String(e)
        return e.cause !== undefined
            ? `${stack}\n\nCaused by: ${getErrorStack(e.cause, seen)}`
            : stack
    } else if (e && typeof e === 'object' && 'message' in e) {
        const code = 'code' in e ? `[${String(e.code)}] ` : ''
        const stack = 'stack' in e && e.stack ? `\n${String(e.stack)}` : ''
        return `${code}${String(e.message)}${stack}`
    } else {
        return String(e)
    }
}

export function getCurrentStack() {
    const { stack } = new Error()

    let newlineCount = 0

    for (let i = 0; i < stack!.length; i++)
        if (stack![i] === '\n' && newlineCount++ === 1)
            return stack!.slice(i + 1)

    return stack!.slice(stack!.indexOf('\n') + 1)
}
