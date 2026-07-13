import urlcat from 'urlcat'
import { first, isEmpty, parseInt, uniqBy } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import { EMPTY_LIST } from '@masknet/shared-base'
import { ChainId, getGoPlusLabsConstants, isValidChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { type FungibleTokenSpender, isSameAddress } from '@masknet/web3-shared-base'
import { GO_PLUS_LABS_ROOT_URL, INFINITE_VALUE } from './constants.js'
import { type GoPlusTokenInfo, type GoPlusTokenSpender, SecurityMessageLevel } from './types.js'
import { SecurityMessages } from './rules.js'
import { getAllMaskDappContractInfo } from '../helpers/getAllMaskDappContractInfo.js'
import { fetchJSON } from '../helpers/fetchJSON.js'
import type { AuthorizationAPI, PhishingSiteResponse, SecurityAPI } from '../entry-types.js'

function checkInWhitelist(chainId: ChainId, address: string) {
    const { WHITE_LISTS } = getGoPlusLabsConstants(chainId)
    return WHITE_LISTS?.some((x) => isSameAddress(x, address))
}

interface SupportedChainResponse {
    id: string
    name: string
}

class GoPlusAuthorizationAPI implements AuthorizationAPI.Provider<ChainId> {
    async getSupportChainIds() {
        return [ChainId.Mainnet, ChainId.BSC]
    }

    async getFungibleTokenSpenders(chainId: ChainId, addresses: string) {
        const supportedChainIds = await this.getSupportChainIds()
        if (!supportedChainIds.includes(chainId)) return EMPTY_LIST

        const maskDappContractInfoList = getAllMaskDappContractInfo(chainId, 'token')

        const response = await fetchJSON<{
            code: 0 | 1
            message: string
            result: GoPlusTokenInfo[]
        }>(urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v2/token_approval_security/:chainId', { chainId, addresses }))

        if (!response.result.length) return EMPTY_LIST

        return response.result
            .reduce<GoPlusTokenSpender[]>((acc, cur) => {
                const tokenInfo = { address: cur.token_address, symbol: cur.token_symbol, name: cur.token_name }

                return acc.concat(
                    cur.approved_list.map((rawSpender) => {
                        const spender = {
                            name: rawSpender.address_info.tag,
                            address: rawSpender.approved_contract,
                            amount:
                                rawSpender.approved_amount === 'Unlimited' ?
                                    INFINITE_VALUE
                                :   new BigNumber(rawSpender.approved_amount).toNumber(),
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
            .toSorted((a, b) => {
                if (a.isMaskDapp && !b.isMaskDapp) return -1
                if (!a.isMaskDapp && b.isMaskDapp) return 1
                return 0
            }) as Array<FungibleTokenSpender<ChainId, SchemaType>>
    }
}

export const GoPlusLabs = {
    async getTokenSecurity(chainId: ChainId, addresses: string[]) {
        const response = await fetchJSON<{
            code: 0 | 1
            // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
            message: 'OK' | string
            result: Record<
                string,
                SecurityAPI.ContractSecurity & SecurityAPI.TokenSecurity & SecurityAPI.TradingSecurity
            >
        }>(
            urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/token_security/:id', {
                id: chainId,
                contract_addresses: uniqBy(addresses, (x) => x.toLowerCase()).join(','),
            }),
        )

        if (response.code !== 1) return
        return createTokenSecurity(response.result, chainId)
    },

    async getAddressSecurity(
        chainId: ChainId | 'solana' | 'tron',
        address: string,
    ): Promise<SecurityAPI.AddressSecurity | undefined> {
        if (chainId !== 'solana' && chainId !== 'tron' && !isValidChainId(chainId)) return
        const response = await fetchJSON<{
            code: 0 | 1
            // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
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
    },

    async checkIfAddressIsScam(chainId: ChainId | 'solana' | 'tron', address: string): Promise<boolean> {
        const security = await GoPlusLabs.getAddressSecurity(chainId, address)
        if (!security) return false
        const values: string[] = Object.values(security)
        return values.includes('1')
    },

    async getSupportedChain(): Promise<Array<SecurityAPI.SupportedChain<ChainId>>> {
        const { code, result } = await fetchJSON<{
            code: 0 | 1
            // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
            message: 'OK' | string
            result: SupportedChainResponse[]
        }>(urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/supported_chains'))

        if (code !== 1) return []
        return result.map((x) => ({ chainId: parseInt(x.id) ?? ChainId.Mainnet, name: x.name }))
    },
    async checkIsPhishingSite(url: string): Promise<boolean> {
        const path = urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/phishing_site', {
            url,
        })
        const res = await fetchJSON<PhishingSiteResponse>(path)
        if (res.code !== 1) return false
        return +res.result.phishing_site === 1
    },
}
export const GoPlusAuthorization = new GoPlusAuthorizationAPI()

function createTokenSecurity(
    response: Record<string, SecurityAPI.ContractSecurity & SecurityAPI.TokenSecurity & SecurityAPI.TradingSecurity>,
    chainId?: ChainId,
) {
    if (isEmpty(response) || !isValidChainId(chainId)) return
    const entity = first(Object.entries(response))
    if (!entity) return
    const tokenSecurity = { ...entity[1], contract: entity[0], chainId }
    const is_high_risk = isHighRisk(tokenSecurity)
    const makeMessageList = getMessageList(tokenSecurity)
    const risk_item_quantity = makeMessageList.filter((x) => x.level === SecurityMessageLevel.High).length
    const warn_item_quantity = makeMessageList.filter((x) => x.level === SecurityMessageLevel.Medium).length
    const inWhitelist = chainId ? checkInWhitelist(chainId, tokenSecurity.contract) : false
    return {
        ...tokenSecurity,
        is_high_risk: inWhitelist ? false : is_high_risk,
        risk_item_quantity: inWhitelist ? 0 : risk_item_quantity,
        warn_item_quantity: inWhitelist ? 0 : warn_item_quantity,
        message_list: makeMessageList,
    }
}

function isHighRisk(tokenSecurity?: SecurityAPI.TokenSecurityType) {
    if (!tokenSecurity) return false
    return tokenSecurity.trust_list === '1' ?
            false
        :   SecurityMessages.filter(
                (x) =>
                    x.condition(tokenSecurity) &&
                    x.level !== SecurityMessageLevel.Safe &&
                    !x.shouldHide(tokenSecurity) &&
                    x.level === SecurityMessageLevel.High,
            ).toSorted((a, z) => {
                if (a.level === SecurityMessageLevel.High) return -1
                if (z.level === SecurityMessageLevel.High) return 1
                return 0
            }).length > 0
}

function getMessageList(tokenSecurity: SecurityAPI.TokenSecurityType) {
    return tokenSecurity.trust_list === '1' ?
            []
        :   SecurityMessages.filter(
                (x) =>
                    x.condition(tokenSecurity) && x.level !== SecurityMessageLevel.Safe && !x.shouldHide(tokenSecurity),
            ).toSorted((a, z) => {
                if (a.level === SecurityMessageLevel.High) return -1
                if (z.level === SecurityMessageLevel.High) return 1
                return 0
            })
}
