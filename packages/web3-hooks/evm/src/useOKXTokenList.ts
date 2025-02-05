import { OKX } from '@masknet/web3-providers'
import { TokenType, type FungibleToken } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { skipToken, useQuery } from '@tanstack/react-query'

export function useOKXTokenList(chainId: ChainId | undefined, enabled = true) {
    return useQuery({
        enabled: enabled && !!chainId,
        queryKey: ['okx-tokens', chainId],
        queryFn:
            chainId ?
                async () => {
                    const list = await OKX.getTokens(chainId)
                    if (chainId === ChainId.Scroll && list && !list.some((x) => x.symbol === 'SCR')) {
                        const scrAddr = '0xd29687c813D741E2F938F4aC377128810E217b1b'
                        const SCR_Token: FungibleToken<ChainId, SchemaType> = {
                            id: scrAddr,
                            chainId: ChainId.Scroll,
                            type: TokenType.Fungible,
                            schema: SchemaType.ERC20,
                            address: scrAddr,
                            symbol: 'SCR',
                            name: 'Scroll',
                            decimals: 18,
                            logoURL:
                                'https://www.okx.com/cdn/web3/currency/token/small/534352-0xd29687c813d741e2f938f4ac377128810e217b1b-97?v=1738011884368',
                        }
                        return [...list, SCR_Token]
                    }
                    return list
                }
            :   skipToken,
    })
}
