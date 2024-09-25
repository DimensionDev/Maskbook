import { parseEIP4361Message, type EIP4361Message } from '@masknet/web3-shared-base'
import { ErrorEditor, EthereumMethodType } from '@masknet/web3-shared-evm'
import { useEffect, useMemo } from 'react'
import { SignRequestInfo } from '../../../components/SignRequestInfo/index.js'
import { useInteractionWalletContext } from './InteractionContext.js'
import type { InteractionItemProps } from './interaction.js'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { Trans } from '@lingui/macro'

/**
 * string: personal_sign
 * object: eth_signTypedData_v4/eth_signTypedData/eth_signTypedData_v3/eth_sign
 */
type RawSigningMessage = string | object | undefined
/**
 * string: utf-8 string parsed from hex string like "0x..."
 * EIP4361Message: parsed from EIP4361 message
 */
type ParsedSigningMessage = string | EIP4361Message | undefined

export function WalletSignRequest(props: InteractionItemProps) {
    const { setConfirmAction, setConfirmVerb, setIsDanger, currentRequest } = props
    const { origin, ID: id } = currentRequest
    const request = currentRequest.request.arguments

    const { Message } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    useEffect(() => setConfirmVerb(<Trans>Sign</Trans>), [])

    setConfirmAction(async () => {
        const params = structuredClone(request.params)
        if (request.method === EthereumMethodType.eth_signTypedData_v4) {
            if (typeof params[1] === 'object') params[1] = JSON.stringify(params[1])
        }
        if (request.method === EthereumMethodType.eth_sendTransaction) {
            if (params[0].type === '0x0') {
                delete params[0].type
                delete params[0].gasPrice
            }
        }

        const response = await Message!.approveAndSendRequest(id, {
            arguments: {
                method: request.method,
                params,
            },
            options: {},
        })
        const editor = response ? ErrorEditor.from(null, response) : undefined
        if (editor?.presence) throw editor.error
    })

    {
        let interactingWallet: string | undefined
        // TODO: does this support EIP-4337 wallet correctly?
        if (request.method === EthereumMethodType.eth_signTypedData_v4) interactingWallet = request.params[0]
        if (request.method === EthereumMethodType.personal_sign) interactingWallet = request.params[1]
        if (request.method === EthereumMethodType.eth_sendTransaction) interactingWallet = request.params[0]?.from
        interactingWallet = String(interactingWallet)

        const { useInteractionWallet } = useInteractionWalletContext()
        useInteractionWallet(interactingWallet)
    }
    const rawMessage = useMemo((): RawSigningMessage | undefined => {
        const { method, params } = request

        if (method === EthereumMethodType.eth_signTypedData_v4) {
            if (typeof params[1] === 'object') return params[1]
            return
        } else if (method === EthereumMethodType.personal_sign) {
            if (typeof params[0] === 'string') return params[0]
            return
        } else if (method === EthereumMethodType.eth_sign) {
            if (typeof params[1] === 'string') return params[1]
            return
        } else return
    }, [request])

    const message: ParsedSigningMessage = useMemo(() => {
        if (typeof rawMessage !== 'string') return
        const plain = tryParseStringMessage(rawMessage)
        return parseEIP4361Message(plain, origin) || plain
    }, [rawMessage, origin])

    useEffect(() => {
        if (typeof message !== 'object') return
        if (origin && !origin.startsWith('https:')) setIsDanger(true)
        else if (message.invalidFields.filter((x) => x !== 'chainId' && x !== 'version').length || !message.parsed)
            setIsDanger(true)
        else setIsDanger(false)
    }, [message])

    return <SignRequestInfo message={message} rawMessage={rawMessage} origin={origin} />
}

function tryParseStringMessage(message: string) {
    if (!message.startsWith('0x')) return message
    return new TextDecoder().decode(
        new Uint8Array([...message.slice(2).matchAll(/([\da-f]{2})/gi)].map((i) => Number.parseInt(i[0], 16))),
    )
}
