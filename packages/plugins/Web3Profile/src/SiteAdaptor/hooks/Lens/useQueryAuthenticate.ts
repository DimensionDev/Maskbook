import { useCallback } from 'react'
import { isBefore, add } from 'date-fns'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMWeb3, Lens } from '@masknet/web3-providers'
import { ChainId, isValidAddress } from '@masknet/web3-shared-evm'
import { lensStorage as storage } from '../../context.js'

export function useQueryAuthenticate(address: string, profileId?: string) {
    const { chainId } = useChainContext()

    return useCallback(async () => {
        if (!address || chainId !== ChainId.Polygon || !isValidAddress(address) || !profileId) return

        const accessToken = storage.accessToken?.value?.[profileId]
        const refreshToken = storage.refreshToken?.value?.[profileId]
        if (accessToken && isBefore(new Date(), accessToken.expireDate)) {
            return accessToken.token
        } else if (refreshToken && isBefore(new Date(), refreshToken.expireDate)) {
            const authenticate = await Lens.refresh(refreshToken.token)
            if (!authenticate) return
            // Only reset accessToken
            await storage.accessToken?.setValue({
                ...storage.accessToken.value,
                [profileId]: {
                    token: authenticate.accessToken,
                    expireDate: add(new Date(), { minutes: 30 }),
                },
            })
            return authenticate.accessToken
        }

        const challenge = await Lens.queryChallenge(address, profileId)
        if (!challenge) return

        const signature = await EVMWeb3.signMessage('message', challenge.text)
        const authenticate = await Lens.authenticate(challenge.id, signature)
        if (!authenticate) return

        /**
         * accessToken - This lasts 30 minutes before needed to be refreshed
         * refreshToken - This lasts 7 days to allow you to keep them logged in and generate a new accessToken when they come back without them having to sign a challenge again.
         */

        await storage.accessToken?.setValue({
            ...storage.accessToken.value,
            [profileId]: {
                token: authenticate.accessToken,
                expireDate: add(new Date(), { minutes: 30 }),
            },
        })

        await storage.refreshToken?.setValue({
            ...storage.refreshToken.value,
            [profileId]: {
                token: authenticate.refreshToken,
                expireDate: add(new Date(), { days: 7 }),
            },
        })

        return authenticate.accessToken
    }, [address, chainId, profileId])
}
