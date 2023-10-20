export function __wagmi__execute(providerType: string, id: number, methodName: string, args: unknown[]) {
    console.log('DEBUG: wagmi execute')
    console.log({
        providerType,
        methodName,
        id,
        args,
    })
}
