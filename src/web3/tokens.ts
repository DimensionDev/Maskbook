import contractMap from 'eth-contract-metadata'
import mainnet from './erc20/mainnet.json'
import rinkeby from './erc20/rinkeby.json'
import { ChainId } from './types'
import { uniqBy } from 'lodash-es'
import type { ERC20Token } from '../plugins/Wallet/token'

const ERC20Tokens = {
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
        ...x,
    })),
    [ChainId.Rinkeby]: [...rinkeby.built_in_tokens, ...rinkeby.predefined_tokens].map((x) => ({
        chainId: ChainId.Rinkeby,
        ...x,
    })),
    [ChainId.Ropsten]: [].map((x) => ({
        chainId: ChainId.Ropsten,
        ...(x as ERC20Token),
    })),
    [ChainId.Kovan]: [],
}

export function getERC20Tokens(chainId: ChainId) {
    return uniqBy(ERC20Tokens[chainId] as ERC20Token[], (token) => token.address.toUpperCase())
}
