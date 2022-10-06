/**
 * Get a persona bound with the currently visiting identity from DB
 */
export function useCurrentVisitingPersona() {
    const identity = useCurrentVisitingIdentity()
    return useAsyncRetry(async () => queryPersonaFromDB(identity), [identity.identifier?.toText()])
}
