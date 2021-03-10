import stringify from 'json-stable-stringify'
import { getConstant } from '../../../../web3/helpers'
import { TRENDING_CONSTANTS } from '../../constants'
import { getChainId } from '../../../../extension/background-script/EthereumService'

/**
 * @notice Fetches tokens for an array of symbols (case-sensitive).
 * @param listOfSymbol
 * @param size
 */
export async function fetchTokensByListOfSymbols(listOfSymbol: string[], size = 5) {
    // thegraph does not support case-insensitive searching
    // so cased keywords will be added too
    const expandedListOfSymbol = [...new Set(listOfSymbol.flatMap((x) => [x, x.toLowerCase(), x.toUpperCase()]))]

    const response = await fetch(getConstant(TRENDING_CONSTANTS, 'UNISWAP_V2_SUBGRAPH_URL', await getChainId()), {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
            query: `
            {
                tokens (where: { symbol_in: ${stringify(expandedListOfSymbol)} }) {
                    id
                    name
                    symbol
                    decimals
                }
            }
            `,
        }),
    })
    const { data } = (await response.json()) as {
        data: {
            tokens: {
                id: string
                name: string
                symbol: string
                decimals: number
            }[]
        }
    }
    return data.tokens
}
