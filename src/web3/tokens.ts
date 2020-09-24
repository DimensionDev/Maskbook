import contractMap from 'eth-contract-metadata'
import mainnet from './erc20/mainnet.json'
import rinkeby from './erc20/rinkeby.json'
import { ChainId, Token, EthereumTokenType } from './types'
import { uniqBy } from 'lodash-es'

const ERC20Tokens: {
    [chainId in ChainId]: Token[]
} = {
    [ChainId.Mainnet]: [
        ...Object.entries(contractMap)
            .filter(([_, token]) => token.erc20)
            .map(([address, token]) => ({
                address,
                decimals: token.decimals,
                name: token.name,
                symbol: token.symbol,
            }))
            .filter(Boolean),
        ...mainnet.built_in_tokens.filter((token) => !contractMap[token.address]),
        ...mainnet.predefined_tokens.filter((token) => !contractMap[token.address]),
    ].map((x) => ({
        chainId: ChainId.Mainnet,
        type: EthereumTokenType.ERC20,
        ...x,
    })),
    [ChainId.Rinkeby]: [...rinkeby.built_in_tokens, ...rinkeby.predefined_tokens].map((x) => ({
        chainId: ChainId.Rinkeby,
        type: EthereumTokenType.ERC20,
        ...x,
    })),
    [ChainId.Ropsten]: [],
    [ChainId.Kovan]: [],
}

export function getERC20Tokens(chainId: ChainId) {
    return uniqBy(ERC20Tokens[chainId], (token) => token.address.toUpperCase())
}
