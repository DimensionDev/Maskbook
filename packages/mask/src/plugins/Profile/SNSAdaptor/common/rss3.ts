/* eslint-disable import/no-anonymous-default-export */
import { ethers } from 'ethers'
import RSS3 from 'rss3-next'
import axios from 'axios'
import type { RSS3Account, RSS3Profile } from 'rss3-next/types/rss3'
import type { GitcoinResponse, GeneralAsset, NFTResponse, POAPResponse } from './types'
import config from './config'
import rns from './rns'
import Events from './events'
import Services from '../../../../extension/service'

export const EMPTY_RSS3_DP: RSS3DetailPersona = {
    persona: null,
    address: '',
    name: '',
    profile: null,
    followers: [],
    followings: [],
    isReady: false,
}
const RSS3PageOwner: RSS3DetailPersona = Object.create(EMPTY_RSS3_DP)
const RSS3LoginUser: RSS3DetailPersona = Object.create(EMPTY_RSS3_DP)
const assetsProfileCache: Map<string, IAssetProfile> = new Map()
let ethersProvider: ethers.providers.Web3Provider | null

export type IRSS3 = RSS3

export interface IAssetProfile {
    assets: GeneralAsset[]
    status?: boolean
}

export interface RSS3DetailPersona {
    persona: RSS3 | null
    address: string
    name: string
    profile: RSS3Profile | null
    followers: string[]
    followings: string[]
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
    if (user.name && !user.address) {
        user.address = await rns.name2Addr(user.name)
    }
    if (user.address && !user.name) {
        user.name = await rns.addr2Name(user.address)
    }
    const RSS3APIPersona = apiPersona()
    user.profile = await RSS3APIPersona.profile.get(user.address)
    user.followers = await RSS3APIPersona.backlinks.get(user.address, 'following')
    user.followings = (await RSS3APIPersona.links.get(user.address, 'following'))?.list || []
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
        } else {
            if (RSS3PageOwner.name !== addrOrName) {
                isReloadRequired = true
                RSS3PageOwner.name = addrOrName
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
                const res = await axios.get(`/assets/list`, {
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
            const res = await axios.get(`/assets/details`, {
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
            const res = await axios.get(`/assets/details`, {
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
            const res = await axios.get(`/assets/details`, {
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

    addNewMetamaskAccount: async (): Promise<RSS3Account> => {
        // js don't support multiple return values,
        // so here I'm using signature as a message provider
        if (!RSS3LoginUser.persona) {
            return {
                platform: '',
                identity: '',
                signature: 'Not logged in',
            }
        }
        const metamaskEthereum = (window as any).ethereum
        ethersProvider = new ethers.providers.Web3Provider(metamaskEthereum)
        const accounts = await metamaskEthereum.request({
            method: 'eth_requestAccounts',
        })
        const address = ethers.utils.getAddress(accounts[0])

        const newTmpAddress: RSS3Account = {
            platform: 'EVM+',
            identity: address,
        }

        const signature =
            (await ethersProvider
                ?.getSigner()
                .signMessage(RSS3LoginUser.persona.accounts.getSigMessage(newTmpAddress))) || ''

        return {
            platform: 'EVM+',
            identity: address,
            signature: signature,
        }
    },
}
