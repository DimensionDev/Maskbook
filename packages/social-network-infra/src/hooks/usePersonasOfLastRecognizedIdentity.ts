/**
 * Get all personas bound with the last recognized identity from NextID service
 */
export function useLastRecognizedPersonas() {
    const identity = useLastRecognizedIdentity()
    return useAsyncRetry(async () => {
        const bindings = await queryPersonasFromNextID(identity)
        return bindings?.sort((a, b) => sortPersonaBindings(a, b, identity.identifier?.userId.toLowerCase()))
    }, [identity.identifier?.userId])
}
