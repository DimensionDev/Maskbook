import { v4 as uuid } from 'uuid'
import { keccakFromString, ecsign, bufferToHex, toRpcSig, privateToPublic, publicToAddress } from 'ethereumjs-util'
import { encodeText, timeout } from '@masknet/kit'
import { personalSign } from '@metamask/eth-sig-util'
import type { Transaction } from '@masknet/web3-shared-evm'
import { Web3 } from '@masknet/web3-providers'
import {
    PersonaIdentifier,
    fromBase64URL,
    PopupRoutes,
    ECKeyIdentifier,
    toHex,
    PersonaSignResult,
    PersonaSignRequest,
} from '@masknet/shared-base'
import { MaskMessages } from '../../../../shared/index.js'
import { queryPersonasWithPrivateKey } from '../../../../background/database/persona/db.js'
import { openPopupWindow } from '../../../../background/services/helper/index.js'

/**
 * Generate a signature with confirmation from user
 */
export async function signWithPersona<T>({
    method,
    message,
    identifier,
}: PersonaSignRequest<T>): Promise<PersonaSignResult> {
    const requestID = uuid()
    await openPopupWindow(PopupRoutes.PersonaSignRequest, { message, requestID, identifier: identifier?.toText() })

    const signer = await timeout(
        new Promise<PersonaIdentifier>((resolve, reject) => {
            MaskMessages.events.personaSignRequest.on((approval) => {
                if (approval.requestID !== requestID) return
                if (!approval.selectedPersona) reject(new Error('Persona Rejected'))
                resolve(approval.selectedPersona!)
            })
        }),
        60 * 1000,
        'Timeout',
    )

    switch (method) {
        case 'eth':
            return generateEthSignResult(signer, message as string)
        case 'personal':
            return generatePersonalSignResult(signer, message as string)
        case 'transaction':
            return generateTransactionSignResult(signer, message as Transaction)
        default:
            throw new Error(`Unknown sign method: ${method}.`)
    }
}

export async function generateSignResult<T>(
    method: PersonaSignRequest<T>['method'],
    signer: ECKeyIdentifier,
    message: T,
): Promise<PersonaSignResult> {
    switch (method) {
        case 'eth':
            return generateEthSignResult(signer, message as string)
        case 'personal':
            return generatePersonalSignResult(signer, message as string)
        case 'transaction':
            return generateTransactionSignResult(signer, message as Transaction)
        default:
            throw new Error(`Unknown sign method: ${method}.`)
    }
}

/**
 * Sign a raw message (eth sign)
 * @param signer
 * @param message
 * @returns
 */
export async function generateEthSignResult(signer: ECKeyIdentifier, message: string) {
    const persona = (await queryPersonasWithPrivateKey()).find((x) => x.identifier === signer)
    if (!persona) throw new Error('Persona not found')
    const privateKey = Buffer.from(fromBase64URL(persona.privateKey.d!))
    return {
        persona: persona.identifier,
        signature: personalSign({
            privateKey,
            data: message,
        }),
        address: bufferToHex(publicToAddress(privateToPublic(privateKey))),
    }
}

/**
 * Sign as an EVM message (personal sign)
 * @param signer
 * @param message
 * @returns
 */
export async function generatePersonalSignResult(signer: ECKeyIdentifier, message: string) {
    const persona = (await queryPersonasWithPrivateKey()).find((x) => x.identifier === signer)
    if (!persona) throw new Error('Persona not found')

    const length = encodeText(message).length
    const messageHash = keccakFromString(`\x19Ethereum Signed Message:\n${length}${message}`, 256)
    const privateKey = Buffer.from(fromBase64URL(persona.privateKey.d!))
    const signature = ecsign(messageHash, privateKey)

    return {
        persona: persona.identifier,
        signature: toRpcSig(signature.v, signature.r, signature.s),
        address: bufferToHex(publicToAddress(privateToPublic(privateKey))),
    }
}

/**
 * Sign an EVM transaction
 * @param signer
 * @param transaction
 * @returns
 */
export async function generateTransactionSignResult(signer: ECKeyIdentifier, transaction: Transaction) {
    const persona = (await queryPersonasWithPrivateKey()).find((x) => x.identifier === signer)
    if (!persona) throw new Error('Persona not found')
    const privateKey = Buffer.from(fromBase64URL(persona.privateKey.d!))

    const chainId = transaction.chainId
    if (!chainId) throw new Error('Invalid chain id.')

    const { rawTransaction } = await Web3.createWeb3(chainId).eth.accounts.signTransaction(
        transaction,
        toHex(privateKey),
    )
    if (!rawTransaction) throw new Error('Failed to sign transaction.')

    return {
        persona: persona.identifier,
        signature: rawTransaction,
        address: bufferToHex(publicToAddress(privateToPublic(privateKey))),
    }
}
