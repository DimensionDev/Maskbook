import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { useCurrentLinkedPersona } from '@masknet/shared'
import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { SolanaChainResolver, SOLWeb3 } from '@masknet/web3-providers'
import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { multipliedBy, rightShift, type FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-solana'
import { noop, omit } from 'lodash-es'
import {
    createContext,
    memo,
    useContext,
    useMemo,
    useState,
    type Dispatch,
    type PropsWithChildren,
    type SetStateAction,
} from 'react'
import { DURATION, PRESET_THEMES, RED_PACKET_DEFAULT_SHARES } from '../../constants.js'
import { t } from '@lingui/core/macro'

export enum ConditionType {
    Crypto = 'Crypto',
    NFT = 'NFT',
}

interface RedPacketContextOptions {
    theme: FireflyRedPacketAPI.ThemeGroupSettings | undefined
    themes: FireflyRedPacketAPI.ThemeGroupSettings[]
    setTheme: Dispatch<SetStateAction<FireflyRedPacketAPI.ThemeGroupSettings | undefined>>
    customThemes: FireflyRedPacketAPI.ThemeGroupSettings[]
    setCustomThemes: Dispatch<SetStateAction<FireflyRedPacketAPI.ThemeGroupSettings[]>>
    message: string
    inputMessage: string
    setInputMessage: Dispatch<SetStateAction<string>>
    creator: string
    tokenQuantity: string
    setTokenQuantity: Dispatch<SetStateAction<string>>
    token: FungibleToken<ChainId, SchemaType> | undefined
    setToken: Dispatch<SetStateAction<FungibleToken<ChainId, SchemaType> | undefined>>
    nativeToken: FungibleToken<ChainId, SchemaType>
    rawAmount: string
    setRawAmount: Dispatch<SetStateAction<string>>
    settings: {
        duration: number
        name: string
        shares: number
        token?: FungibleToken<ChainId, SchemaType.Native | SchemaType.Fungible>
        total: string
    }
    // TODO use boolean
    isRandom: boolean
    setIsRandom: Dispatch<SetStateAction<boolean>>
    shares: number
    setShares: Dispatch<SetStateAction<number>>
    publicKey: string
    password?: string
}
export const RedPacketContext = createContext<RedPacketContextOptions>({
    theme: undefined,
    themes: EMPTY_LIST,
    setTheme: noop,
    customThemes: EMPTY_LIST,
    setCustomThemes: noop,
    message: '',
    inputMessage: '',
    setInputMessage: noop,
    creator: '',
    tokenQuantity: '',
    setTokenQuantity: noop,
    token: undefined,
    setToken: noop,
    nativeToken: null!,
    rawAmount: '',
    setRawAmount: noop,
    settings: null!,
    isRandom: true,
    setIsRandom: noop,
    shares: 0,
    setShares: noop,
    publicKey: '',
    password: '',
})

interface Props extends PropsWithChildren {}

export const SOLRedPacketProvider = memo(function RedPacketProvider({ children }: Props) {
    const [theme = PRESET_THEMES[0], setTheme] = useState<FireflyRedPacketAPI.ThemeGroupSettings>()
    const [customThemes, setCustomThemes] = useState<FireflyRedPacketAPI.ThemeGroupSettings[]>([])
    const [inputMessage, setInputMessage] = useState('')

    const allThemes = useMemo(
        () => (customThemes ? [...PRESET_THEMES, ...customThemes] : PRESET_THEMES),
        [customThemes],
    )
    const [tokenQuantity, setTokenQuantity] = useState('')

    // Token
    const [rawAmount, setRawAmount] = useState('')
    const [isRandom, setIsRandom] = useState<boolean>(true)
    const [shares, setShares] = useState<number>(RED_PACKET_DEFAULT_SHARES)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_SOLANA>()
    const nativeToken = useMemo(() => SolanaChainResolver.nativeCurrency(chainId), [chainId])
    const [token = nativeToken, setToken] = useState<FungibleToken<ChainId, SchemaType>>()

    const myIdentity = useLastRecognizedIdentity()
    const linkedPersona = useCurrentLinkedPersona()

    const creator = myIdentity?.identifier?.userId || linkedPersona?.nickname || 'Unknown User'

    const amount = rightShift(rawAmount || '0', token?.decimals)
    const totalAmount = useMemo(() => multipliedBy(amount, isRandom ? 1 : (shares ?? '0')), [amount, shares, isRandom])
    const settings = useMemo(
        () => ({
            duration: DURATION,
            name: creator,
            shares: shares || 0,
            token:
                token ?
                    (omit(token, ['logoURI']) as FungibleToken<ChainId, SchemaType.Fungible | SchemaType.Native>)
                :   undefined,
            total: totalAmount.toFixed(),
        }),
        [creator, shares, token, totalAmount],
    )

    const { account: publicKey, privateKey } = useMemo(() => SOLWeb3.createAccount(), [])

    const contextValue = useMemo(() => {
        return {
            themes: allThemes,
            theme,
            setTheme,
            customThemes,
            setCustomThemes,
            message: inputMessage || t`Best Wishes!`,
            inputMessage,
            setInputMessage,
            creator,
            tokenQuantity,
            setTokenQuantity,
            token,
            setToken,
            nativeToken,
            rawAmount,
            setRawAmount,
            settings,
            isRandom,
            setIsRandom,
            shares,
            setShares,
            publicKey,
            password: privateKey,
        }
    }, [
        theme,
        allThemes,
        customThemes,
        settings,
        inputMessage,
        token,
        nativeToken,
        rawAmount,
        creator,
        tokenQuantity,
        isRandom,
        shares,
        publicKey,
        privateKey,
    ])

    return <RedPacketContext.Provider value={contextValue}>{children}</RedPacketContext.Provider>
})

export function useSolRedpacket() {
    return useContext(RedPacketContext)
}
