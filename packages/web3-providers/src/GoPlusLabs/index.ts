import urlcat from 'urlcat'
import { first, isEmpty, parseInt, uniqBy } from 'lodash-es'
import { ChainId, isValidChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { AuthorizationAPI, SecurityAPI } from '../index.js'
import { fetchJSON } from '../helpers.js'
import { GO_PLUS_LABS_ROOT_URL, INFINITE_VALUE } from './constants.js'
import { SecurityMessageLevel } from './types.js'
import { SecurityMessages } from './rules.js'
import { getAllMaskDappContractInfo } from '../rabby/helpers.js'
import type { GoPlusNFTInfo, GoPlusTokenInfo, GoPlusTokenSpender, NFTSpenderInfo } from './type.js'
import { EMPTY_LIST } from '@masknet/shared-base'
import { FungibleTokenSpender, isSameAddress, NonFungibleContractSpender } from '@masknet/web3-shared-base'
import { BigNumber } from 'bignumber.js'

export interface SupportedChainResponse {
    id: string
    name: string
}

export class GoPlusAuthorizationAPI implements AuthorizationAPI.Provider<ChainId> {
    async getNonFungibleTokenSpenders(chainId: ChainId, addresses: string) {
        const maskDappContractInfoList = getAllMaskDappContractInfo(chainId, 'nft')
        const response = await fetchJSON<{
            result: GoPlusNFTInfo[]
        }>(urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v2/nft721_approval_security/:chainId', { chainId, addresses }))

        if (!response.result?.length) return EMPTY_LIST

        return response.result
            .reduce<NFTSpenderInfo[]>((acc, cur) => {
                return acc.concat(
                    cur.approved_list.map((rawSpender) => {
                        const maskDappContractInfo = maskDappContractInfoList.find((y) =>
                            isSameAddress(y.address, rawSpender.approved_contract),
                        )

                        if (maskDappContractInfo) {
                            return {
                                isMaskDapp: true,
                                address: rawSpender.approved_contract,
                                amount: '1',
                                name: maskDappContractInfo.name,
                                logo: maskDappContractInfo.logo,
                                contract: {
                                    address: cur.nft_address,
                                    name: cur.nft_name,
                                },
                            }
                        }

                        return {
                            isMaskDapp: false,
                            address: rawSpender.approved_contract,
                            amount: '1',
                            name: rawSpender.address_info.tag,
                            logo: undefined,
                            contract: {
                                address: cur.nft_address,
                                name: cur.nft_name,
                            },
                        }
                    }),
                )
            }, [])
            .sort((a, b) => {
                if (a.isMaskDapp && !b.isMaskDapp) return -1
                if (!a.isMaskDapp && b.isMaskDapp) return 1
                return Number(b.amount) - Number(a.amount)
            }) as Array<NonFungibleContractSpender<ChainId, SchemaType>>
    }

    async getFungibleTokenSpenders(chainId: ChainId, addresses: string) {
        const maskDappContractInfoList = getAllMaskDappContractInfo(chainId, 'token')

        const response = await fetchJSON<{
            code: 0 | 1
            message: string
            result: GoPlusTokenInfo[]
        }>(urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v2/token_approval_security/:chainId', { chainId, addresses }))

        if (!response?.result?.length) return EMPTY_LIST

        return response.result
            .reduce<GoPlusTokenSpender[]>((acc, cur) => {
                const tokenInfo = { address: cur.token_address, symbol: cur.token_symbol, name: cur.token_name }

                return acc.concat(
                    cur.approved_list.map((rawSpender) => {
                        const spender = {
                            name: rawSpender.address_info.tag,
                            address: rawSpender.approved_contract,
                            amount:
                                rawSpender.approved_amount === 'Unlimited'
                                    ? INFINITE_VALUE
                                    : new BigNumber(rawSpender.approved_amount).toNumber(),
                            tokenInfo,
                        }

                        const maskDappContractInfo = maskDappContractInfoList.find((x) =>
                            isSameAddress(x.address, spender.address),
                        )

                        if (maskDappContractInfo) {
                            return {
                                ...spender,
                                name: maskDappContractInfo.name,
                                logo: maskDappContractInfo.logo,
                                isMaskDapp: true,
                            }
                        }

                        return { ...spender, isMaskDapp: false }
                    }),
                )
            }, [])
            .sort((a, b) => {
                if (a.isMaskDapp && !b.isMaskDapp) return -1
                if (!a.isMaskDapp && b.isMaskDapp) return 1
                return 0
            }) as Array<FungibleTokenSpender<ChainId, SchemaType>>
    }
}

export class GoPlusLabsAPI implements SecurityAPI.Provider<ChainId> {
    async getTokenSecurity(chainId: ChainId, addresses: string[]) {
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
                contract_addresses: uniqBy(addresses, (x) => x.toLowerCase()).join(),
            }),
        )

        if (response.code !== 1) return
        return createTokenSecurity(chainId, response.result)
    }

    async getAddressSecurity(chainId: ChainId, address: string): Promise<SecurityAPI.AddressSecurity | undefined> {
        if (!isValidChainId(chainId)) return
        const response = await fetchJSON<{
            code: 0 | 1
            message: 'OK' | string
            result: SecurityAPI.AddressSecurity
        }>(
            urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/address_security/:address', {
                address,
                chain_id: chainId,
            }),
        )

        if (response.code !== 1) return
        return response.result
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
    response: Record<
        string,
        SecurityAPI.ContractSecurity & SecurityAPI.TokenSecurity & SecurityAPI.TradingSecurity
    > = {},
) => {
    if (isEmpty(response) || !isValidChainId(chainId)) return
    const entity = first(Object.entries(response))
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
                  x.condition(tokenSecurity) &&
                  x.level !== SecurityMessageLevel.Safe &&
                  !x.shouldHide(tokenSecurity) &&
                  x.level === SecurityMessageLevel.High,
          ).sort((a, z) => {
              if (a.level === SecurityMessageLevel.High) return -1
              if (z.level === SecurityMessageLevel.High) return 1
              return 0
          }).length > 0
}

export const getMessageList = (tokenSecurity: SecurityAPI.TokenSecurityType) =>
    tokenSecurity.trust_list === '1'
        ? []
        : SecurityMessages.filter(
              (x) =>
                  x.condition(tokenSecurity) && x.level !== SecurityMessageLevel.Safe && !x.shouldHide(tokenSecurity),
          ).sort((a, z) => {
              if (a.level === SecurityMessageLevel.High) return -1
              if (z.level === SecurityMessageLevel.High) return 1
              return 0
          })
