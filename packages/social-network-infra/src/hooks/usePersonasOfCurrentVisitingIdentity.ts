/**
 * Get all personas bound with the currently visiting identity from NextID service
 */
export function useCurrentVisitingPersonas() {
    const identity = useCurrentVisitingIdentity()
    return useAsyncRetry(async () => {
        const bindings = await queryPersonasFromNextID(identity)
        return bindings?.sort((a, b) => sortPersonaBindings(a, b, identity.identifier?.userId.toLowerCase()))
    }, [identity.identifier?.userId])
}
