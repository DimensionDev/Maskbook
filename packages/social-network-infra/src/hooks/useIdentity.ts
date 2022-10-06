export function useSocialIdentityByUseId(userId?: string) {
    const { value: identity } = useAsync(async () => {
        if (!userId) return
        return activatedSocialNetworkUI.utils.getIdentity?.(userId)
    }, [userId])
    return useSocialIdentity(identity)
}
