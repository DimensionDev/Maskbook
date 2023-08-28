import { compact } from 'lodash-es'
import { useQuery } from '@tanstack/react-query'
import { NetworkPluginID, type BindingProof, NextIDPlatform } from '@masknet/shared-base'
import { useWallets, useWeb3State } from '@masknet/web3-hooks-base'
import { isGreaterThan, isSameAddress, resolveNextIDPlatformWalletName } from '@masknet/web3-shared-base'

export function useVerifiedWallets(proofs?: BindingProof[]) {
    const wallets = useWallets()
    const { NameService } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    return useQuery({
        enabled: !!NameService && !!proofs?.length,
        queryKey: ['popups', 'verified', 'wallets', proofs ? JSON.stringify(proofs) : undefined],
        queryFn: async () => {
            if (!NameService || !proofs) return

            const results = await Promise.all(
                proofs.map(async (x) => {
                    if (x.platform === NextIDPlatform.Ethereum) {
                        const domain = await NameService?.reverse?.(x.identity)

                        if (domain)
                            return {
                                ...x,
                                name: domain,
                            }

                        const wallet = wallets.find((wallet) => isSameAddress(wallet.address, x.identity))

                        if (wallet)
                            return {
                                ...x,
                                name: wallet.name,
                            }

                        return {
                            ...x,
                            name: '',
                        }
                    }
                    return null
                }),
            )

            return compact(results)
                .sort((a, z) => (isGreaterThan(a.last_checked_at, z.last_checked_at) ? -1 : 1))
                .map((x, index, list) => {
                    if (!x.name) {
                        const name = resolveNextIDPlatformWalletName(x.platform)
                        return {
                            ...x,
                            name: `${name} ${list.length - index}`,
                        }
                    }

                    return x
                })
        },
    })
}
