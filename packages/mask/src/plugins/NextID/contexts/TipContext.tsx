import { rightShift } from '@masknet/web3-shared-base'
import {
    ERC721ContractDetailed,
    EthereumTokenType,
    FungibleTokenDetailed,
    isSameAddress,
    TransactionState,
    useNativeTokenDetailed,
    useTokenConstants,
    useTokenTransferCallback,
} from '@masknet/web3-shared-evm'
import { noop } from 'lodash-unified'
import {
    createContext,
    Dispatch,
    FC,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { TipTask, TipType } from '../types'

interface ContextOptions {
    recipient: string
    setRecipient: Dispatch<SetStateAction<string>>
    tipType: TipType
    setTipType: Dispatch<SetStateAction<TipType>>
    recipients: string[]
    setRecipients: Dispatch<SetStateAction<string[]>>
    token: FungibleTokenDetailed | null
    setToken: Dispatch<SetStateAction<FungibleTokenDetailed | null>>
    amount: string
    setAmount: Dispatch<SetStateAction<string>>
    erc721TokenId: string | null
    setErc721TokenId: Dispatch<SetStateAction<string | null>>
    erc721Contract: ERC721ContractDetailed | null
    setErc721Contract: Dispatch<SetStateAction<ERC721ContractDetailed | null>>
}

export const TipContext = createContext<ContextOptions>({
    recipient: '',
    setRecipient: noop,
    tipType: TipType.NFT,
    setTipType: noop,
    recipients: [],
    setRecipients: noop,
    token: null,
    setToken: noop,
    amount: '',
    setAmount: noop,
    erc721TokenId: null,
    setErc721TokenId: noop,
    erc721Contract: null,
    setErc721Contract: noop,
})

interface Props {
    task: TipTask
}

export const TipTaskProvider: FC<Props> = ({ children, task }) => {
    const [recipient, setRecipient] = useState('')
    const [recipients, setRecipients] = useState<string[]>(task.addresses)
    const [tipType, setTipType] = useState<TipType>(TipType.Token)
    const [amount, setAmount] = useState('0')
    const [erc721Contract, setErc721Contract] = useState<ContextOptions['erc721Contract']>(null)
    const { value: nativeTokenDetailed = null } = useNativeTokenDetailed()
    const [token, setToken] = useState<ContextOptions['token']>(nativeTokenDetailed)
    const [erc721TokenId, setErc721TokenId] = useState<ContextOptions['erc721TokenId']>(null)

    useEffect(() => {
        setRecipient(task.to || '')
    }, [task.to])

    useEffect(() => {
        setRecipients(task.addresses)
    }, [task.addresses])

    useEffect(() => {
        if (recipient || recipients.length === 0) return
        setRecipient(recipients[0])
    }, [recipient, recipients])

    useEffect(() => {
        if (token || !nativeTokenDetailed) return
        setToken(nativeTokenDetailed)
    }, [token, nativeTokenDetailed])

    const contextValue = useMemo(() => {
        return {
            recipient,
            setRecipient,
            recipients,
            setRecipients,
            tipType,
            setTipType,
            token,
            setToken,
            amount,
            setAmount,
            erc721TokenId,
            setErc721TokenId,
            erc721Contract,
            setErc721Contract,
        }
    }, [recipient, recipients, tipType, amount, erc721TokenId, erc721Contract, token])
    return <TipContext.Provider value={contextValue}>{children}</TipContext.Provider>
}

type TipTuple = [state: TransactionState, sendTip: () => Promise<void>]

function useTokenTipTuple(): TipTuple {
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const context = useContext(TipContext)
    const { token, amount, recipient } = context

    const isNativeToken = isSameAddress(token?.address, NATIVE_TOKEN_ADDRESS)

    const assetType = isNativeToken ? EthereumTokenType.Native : EthereumTokenType.ERC20
    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        assetType,
        token?.address || '',
    )
    const sendTip = useCallback(async () => {
        const transferAmount = rightShift(amount || '0', token?.decimals || 0).toFixed()
        await transferCallback(transferAmount, recipient)
        resetTransferCallback()
    }, [amount, token, recipient, transferCallback, resetTransferCallback])

    return [transferState, sendTip]
}

function useNftTipTuple(): TipTuple {
    const context = useContext(TipContext)
    const { recipient, erc721TokenId, erc721Contract } = context

    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        EthereumTokenType.ERC721,
        erc721Contract?.address || '',
    )
    const sendTip = useCallback(async () => {
        if (!erc721TokenId) return
        await transferCallback(erc721TokenId, recipient)
        resetTransferCallback()
    }, [erc721TokenId, recipient, transferCallback, resetTransferCallback])

    return [transferState, sendTip]
}

export function useTip() {
    const context = useContext(TipContext)
    const tokenTipTuple = useTokenTipTuple()
    const nftTipTuple = useNftTipTuple()

    const sendTipTuple = useMemo(() => {
        return context.tipType === TipType.Token ? tokenTipTuple : nftTipTuple
    }, [context.tipType, tokenTipTuple, nftTipTuple])

    return {
        ...context,
        sendState: sendTipTuple[0],
        sendTip: sendTipTuple[1],
    }
}
