import urlcat from 'urlcat'
import { first, isEmpty, parseInt, uniqBy } from 'lodash-unified'
import { ChainId } from '@masknet/web3-shared-evm'
import type { SecurityAPI } from '..'
import { fetchJSON } from '../helpers'
import { GO_PLUS_LABS_ROOT_URL, SecurityMessageLevel } from './constants'
import { SecurityMessages } from './rules'

export interface SupportedChainResponse {
    id: string
    name: string
}

export class GoPlusLabsAPI implements SecurityAPI.Provider<ChainId> {
    async getTokenSecurity(chainId: ChainId, listOfAddress: string[]) {
        const response = await fetchJSON<{
            code: 0 | 1
            message: 'OK' | string
            result: Record<
                string,
                SecurityAPI.ContractSecurity & SecurityAPI.TokenSecurity & SecurityAPI.TradingSecurity
            >
        }>(
            urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/token_security/:id', {
                id: chainId,
                contract_addresses: uniqBy(listOfAddress, (x) => x.toLowerCase()).join(),
            }),
        )

        if (response.code !== 1) return
        return createTokenSecurity(chainId, response.result)
    }

    async getSupportedChain(): Promise<Array<SecurityAPI.SupportedChain<ChainId>>> {
        const { code, result } = await fetchJSON<{
            code: 0 | 1
            message: 'OK' | string
            result: SupportedChainResponse[]
        }>(urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/supported_chains'))

        if (code !== 1) return []
        return result.map((x) => ({ chainId: parseInt(x.id) ?? ChainId.Mainnet, name: x.name }))
    }
}

export const createTokenSecurity = (
    chainId: ChainId,
    response: Record<string, SecurityAPI.ContractSecurity & SecurityAPI.TokenSecurity & SecurityAPI.TradingSecurity>,
) => {
    response ??= {}
    if (isEmpty(response)) return
    const entity = first(Object.entries(response ?? {}))
    if (!entity) return
    const tokenSecurity = { ...entity[1], contract: entity[0], chainId }
    const is_high_risk = isHighRisk(tokenSecurity)
    const makeMessageList = getMessageList(tokenSecurity)
    const risk_item_quantity = makeMessageList.filter((x) => x.level === SecurityMessageLevel.High).length
    const warn_item_quantity = makeMessageList.filter((x) => x.level === SecurityMessageLevel.Medium).length
    return {
        ...tokenSecurity,
        is_high_risk,
        risk_item_quantity,
        warn_item_quantity,
        message_list: makeMessageList,
    }
}

export const isHighRisk = (tokenSecurity?: SecurityAPI.TokenSecurityType) => {
    if (!tokenSecurity) return false
    return tokenSecurity.trust_list === '1'
        ? false
        : SecurityMessages.filter(
              (x) =>
                  x.condition(tokenSecurity) && x.level !== SecurityMessageLevel.Safe && !x.shouldHide(tokenSecurity),
          )
              .sort((a) => (a.level === SecurityMessageLevel.High ? -1 : 1))
              .filter((x) => x.level === SecurityMessageLevel.High).length > 0
}

export const getMessageList = (tokenSecurity: SecurityAPI.TokenSecurityType) =>
    tokenSecurity.trust_list === '1'
        ? []
        : SecurityMessages.filter(
              (x) =>
                  x.condition(tokenSecurity) && x.level !== SecurityMessageLevel.Safe && !x.shouldHide(tokenSecurity),
          ).sort((a) => (a.level === SecurityMessageLevel.High ? -1 : 1))
