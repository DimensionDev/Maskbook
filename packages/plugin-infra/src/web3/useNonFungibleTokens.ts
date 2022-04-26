import type { NonFungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAsyncRetry } from 'react-use'

export function useNonFungibleTokens<T extends NetworkPluginID>(
    pluginID?: T,
    listOfAddress?: string[],
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    return useAsyncRetry(
        async () =>
            [] as NonFungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>[],
    )
    // const { Token } = useWeb3State(pluginID)
    // const fungibleTokens = useSubscription(
    //     (Token?.fungibleTokens ?? EMPTY_ARRAY) as Subscription<
    //         FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>[]
    //     >,
    // )
    // return useMemo(() => {
    //     return fungibleTokens.length && schemaType
    //         ? fungibleTokens.filter((x) => x.schema === schemaType)
    //         : fungibleTokens
    // }, [schemaType, fungibleTokens])
}
