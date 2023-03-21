import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { Lens } from '@masknet/web3-providers'
import { ChainId } from '@masknet/web3-shared-evm'
import isBefore from 'date-fns/isBefore'
import add from 'date-fns/add'
import { useAsyncFn } from 'react-use'
import { context, lensTokenStorage as storage } from '../../context.js'

export function useQueryAuthenticate(address: string) {
    const { chainId } = useChainContext()
    const connection = useWeb3Connection()

    return useAsyncFn(async () => {
        if (!address || !connection || chainId !== ChainId.Matic) return

        if (storage.accessToken?.value?.token && isBefore(new Date(), storage.accessToken.value.expireDate)) {
            return storage.accessToken.value.token
        } else if (storage.refreshToken?.value?.token && isBefore(new Date(), storage.refreshToken.value.expireDate)) {
            const authenticate = await Lens.refresh(storage.refreshToken.value.token)
            if (!authenticate) return
            // Only reset accessToken
            await storage.accessToken?.setValue({
                token: authenticate.accessToken,
                expireDate: add(new Date(), { minutes: 30 }),
            })
            return authenticate.accessToken
        }

        const challenge = await Lens.queryChallenge(address)
        if (!challenge) return
        const signature = await connection.signMessage('message', challenge)

        const authenticate = await Lens.authenticate(address, signature)

        if (!authenticate) return

        /**
         * accessToken - This lasts 30 minutes before needed to be refreshed
         * refreshToken - This lasts 7 days to allow you to keep them logged in and generate a new accessToken when they come back without them having to sign a challenge again.
         */

        await storage.accessToken?.setValue({
            token: authenticate.accessToken,
            expireDate: add(new Date(), { minutes: 30 }),
        })

        await storage.refreshToken?.setValue({
            token: authenticate.refreshToken,
            expireDate: add(new Date(), { days: 7 }),
        })

        return authenticate.accessToken
    }, [address, connection, chainId, context.createKVStorage])
}
