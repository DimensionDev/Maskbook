export function unreachable(value: never): never {
    console.error('Unhandled value: ', value)
    throw new Error('Unreachable case:' + value)
}

export function safeUnreachable(value: never) {
    console.error('Unhandled value: ', value)
}
