/**
 * Get a persona bound with the last recognized identity from DB
 */
export function usePersonaOfLastRecognizedIdentity() {
    const identity = useLastRecognizedIdentity()
    return useAsyncRetry(async () => queryPersonaFromDB(identity), [identity.identifier?.toText()])
}
