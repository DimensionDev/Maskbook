import { ChainId, createClient, getTokenConstants } from '@masknet/web3-shared-flow'

export function fetchBalanceUSDT(chainId: ChainId, address?: string) {
    const client = createClient(chainId)
    const { TETHER_ADDRESS = '', FUNGIBLE_TOKEN_ADDRESS = '' } = getTokenConstants(chainId)

    return client.query({
        cadence: `
            import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}
            import TeleportedTetherToken from ${TETHER_ADDRESS}

            pub fun main(address: Address): UFix64 {
                let account = getAccount(address)
                let vaultRef = account
                    .getCapability(/public/teleportedTetherTokenBalance)
                    .borrow<&TeleportedTetherToken.Vault{FungibleToken.Balance}>()
                    ?? panic("Could not borrow Balance capability")

                return vaultRef.balance
            }
        `,
        args: (arg, t) => [arg(address, t.Address)],
    })
}
