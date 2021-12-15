/* eslint-disable import/no-anonymous-default-export */
// cspell:ignore: IRSS
import { ethers } from 'ethers'
import RSS3 from 'rss3-next'
import { fetch } from './middleware'
import type { GitcoinResponse, GeneralAsset, NFTResponse, POAPResponse } from './types'
import config from './config'
import Events from './events'
import Services from '../../../../extension/service'

export const EMPTY_RSS3_DP: RSS3DetailPersona = {
    persona: null,
    address: '',
    isReady: false,
}
const RSS3PageOwner: RSS3DetailPersona = Object.create(EMPTY_RSS3_DP)
const RSS3LoginUser: RSS3DetailPersona = Object.create(EMPTY_RSS3_DP)
const assetsProfileCache: Map<string, IAssetProfile> = new Map()

export type IRSS3 = RSS3

export interface IAssetProfile {
    assets: GeneralAsset[]
    status?: boolean
}

export interface RSS3DetailPersona {
    persona: RSS3 | null
    address: string
    isReady: boolean
}

async function connect(address: string, skipSignSync: boolean = false) {
    RSS3LoginUser.persona = new RSS3({
        endpoint: config.hubEndpoint,
        address: address,
        agentSign: true,
        sign: (data: string) =>
            Services.Ethereum.personalSign(ethers.utils.hexlify(ethers.utils.toUtf8Bytes(data)), address.toLowerCase()),
    })
    await initUser(RSS3LoginUser, skipSignSync)

    return RSS3LoginUser
}

async function initUser(user: RSS3DetailPersona, skipSignSync: boolean = false) {
    if (user.persona) {
        if (!user.address) {
            user.address = user.persona.account.address
        }
        user.persona.files.set(await user.persona.files.get(user.address))
        if (!skipSignSync) {
            await user.persona.files.sync()
        }
    }
    user.isReady = true
}

function apiPersona(): RSS3 {
    return (
        RSS3LoginUser.persona ||
        new RSS3({
            endpoint: config.hubEndpoint,
        })
    )
}

function isValidRSS3() {
    return !!RSS3LoginUser.persona
}

function dispatchEvent(event: string, detail: any) {
    const evt = new CustomEvent(event, {
        detail,
        bubbles: true,
        composed: true,
    })
    document.dispatchEvent(evt)
    console.log(event, detail)
}

export default {
    connect: async (address: string) => {
        if (await connect(address)) {
            dispatchEvent(Events.connect, RSS3LoginUser)
            return RSS3LoginUser
        } else {
            return null
        }
    },
    getAPIUser: (): RSS3DetailPersona => {
        const user = Object.create(EMPTY_RSS3_DP)
        user.persona = apiPersona()
        return user
    },
    getLoginUser: () => {
        return RSS3LoginUser
    },
    setPageOwner: async (addrOrName: string) => {
        let isReloadRequired = false
        if (addrOrName.startsWith('0x') && addrOrName.length === 42) {
            if (RSS3PageOwner.address !== addrOrName) {
                isReloadRequired = true
                RSS3PageOwner.address = addrOrName
            }
        }
        if (isReloadRequired) {
            await initUser(RSS3PageOwner)
        }
        dispatchEvent(Events.pageOwnerReady, RSS3PageOwner)
        return RSS3PageOwner
    },
    getPageOwner: () => {
        return RSS3PageOwner
    },
    isValidRSS3,

    getAssetProfile: async (address: string, type: string, refresh: boolean = false) => {
        if (assetsProfileCache.has(address + type) && !refresh) {
            return <IAssetProfile>assetsProfileCache.get(address + type)
        } else {
            let data: IAssetProfile | null = null
            try {
                const res = await fetch(`/assets/list`, {
                    baseURL: config.hubEndpoint,
                    params: {
                        personaID: address,
                        type: type,
                    },
                })
                if (res?.data) {
                    data = <IAssetProfile>res.data
                    assetsProfileCache.set(address + type, data)
                }
            } catch (error) {
                data = null
            }
            return data
        }
    },
    getNFTDetails: async (address: string, platform: string, identity: string, id: string, type: string) => {
        let data: NFTResponse | null = null
        try {
            const res = await fetch(`/assets/details`, {
                baseURL: config.hubEndpoint,
                params: {
                    personaID: address,
                    platform: 'EVM+',
                    id,
                    identity,
                    type,
                },
            })
            if (res?.data) {
                data = <NFTResponse>res.data
            }
        } catch (error) {
            data = null
        }
        return data
    },
    getGitcoinDonation: async (address: string, platform: string, identity: string, id: string) => {
        let data: GitcoinResponse | null = null
        try {
            const res = await fetch(`/assets/details`, {
                baseURL: config.hubEndpoint,
                params: {
                    personaID: address,
                    platform: 'EVM+',
                    id: id,
                    identity: identity,
                    type: 'Gitcoin-Donation',
                },
            })
            if (res?.data) {
                data = <GitcoinResponse>res.data
            }
        } catch (error) {
            data = null
        }
        return data
    },
    getFootprintDetail: async (address: string, platform: string, identity: string, id: string) => {
        let data: POAPResponse | null = null
        try {
            const res = await fetch(`/assets/details`, {
                baseURL: config.hubEndpoint,
                params: {
                    personaID: address,
                    platform: 'EVM+',
                    id: id,
                    identity: identity,
                    type: 'xDai-POAP',
                },
            })
            if (res?.data) {
                data = <POAPResponse>res.data
            }
        } catch (error) {
            data = null
        }
        return data
    },
}
