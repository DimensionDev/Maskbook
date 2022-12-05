import {
    keccakFromString,
    ecsign,
    bufferToHex,
    toRpcSig,
    toCompactSig,
    privateToPublic,
    publicToAddress,
    ECDSASignature,
} from 'ethereumjs-util'
import { MaskMessages } from '../../../../shared/index.js'
import { PersonaIdentifier, fromBase64URL, PopupRoutes, ECKeyIdentifier } from '@masknet/shared-base'
import { queryPersonasWithPrivateKey } from '../../../../background/database/persona/db.js'
import { openPopupWindow } from '../../../../background/services/helper/index.js'
import { delay, encodeText } from '@masknet/kit'
import { personalSign } from '@metamask/eth-sig-util'
export interface SignRequest {
    /** Use that who to sign this message. */
    identifier?: PersonaIdentifier
    /** The message to be signed. */
    message: string
    /** Use what method to sign this message? */
    method: 'eth' | 'personal'
}
export interface SignRequestResult {
    /** The persona user selected to sign the message */
    persona: PersonaIdentifier
    signature: {
        raw: ECDSASignature
        EIP2098: string
        signature: string
    }
    /** Persona converted to a wallet address */
    address: string
    /** Message in hex */
    messageHex: string
}

/**
 * Generate a signature with confirmation from user
 */
export async function signWithPersona({ message, method, identifier }: SignRequest): Promise<SignRequestResult> {
    if (method !== 'eth') throw new Error('Unknown sign method')
    const requestID = Math.random().toString(16).slice(3)
    await openPopupWindow(PopupRoutes.PersonaSignRequest, { message, requestID, identifier: identifier?.toText() })

    const waitForApprove = new Promise<PersonaIdentifier>((resolve, reject) => {
        delay(1000 * 60).then(() => reject(new Error('Timeout')))
        MaskMessages.events.personaSignRequest.on((approval) => {
            if (approval.requestID !== requestID) return
            if (!approval.selectedPersona) reject(new Error('Persona Rejected'))
            resolve(approval.selectedPersona!)
        })
    })
    const signer = await waitForApprove
    return generateSignResult(signer, message)
}

export async function signPayWithPersona({ message, identifier }: Omit<SignRequest, 'method'>): Promise<string> {
    const requestID = Math.random().toString(16).slice(3)
    await openPopupWindow(PopupRoutes.PersonaSignRequest, { message, requestID, identifier: identifier?.toText() })

    const waitForApprove = new Promise<PersonaIdentifier>((resolve, reject) => {
        delay(1000 * 60).then(() => reject(new Error('Timeout')))
        MaskMessages.events.personaSignRequest.on((approval) => {
            if (approval.requestID !== requestID) return
            if (!approval.selectedPersona) reject(new Error('Persona Rejected'))
            resolve(approval.selectedPersona!)
        })
    })
    const signer = await waitForApprove

    return generatePaySignResult(signer, message)
}

/**
 * Generate a signature without confirmation from user
 */
export async function generateSignResult(signer: ECKeyIdentifier, message: string) {
    const persona = (await queryPersonasWithPrivateKey()).find((x) => x.identifier === signer)
    if (!persona) throw new Error('Persona not found')

    const length = encodeText(message).length
    const messageHash = keccakFromString(`\x19Ethereum Signed Message:\n${length}${message}`, 256)
    const privateKey = Buffer.from(fromBase64URL(persona.privateKey.d!))
    const signature = ecsign(messageHash, privateKey)

    return {
        persona: persona.identifier,
        signature: {
            raw: signature,
            signature: toRpcSig(signature.v, signature.r, signature.s),
            EIP2098: toCompactSig(signature.v, signature.r, signature.s),
        },
        address: bufferToHex(publicToAddress(privateToPublic(privateKey))),
        messageHex: bufferToHex(Buffer.from(new TextEncoder().encode(message))),
    }
}

export async function generatePaySignResult(signer: ECKeyIdentifier, message: string) {
    const persona = (await queryPersonasWithPrivateKey()).find((x) => x.identifier === signer)
    if (!persona) throw new Error('Persona not found')
    const privateKey = Buffer.from(fromBase64URL(persona.privateKey.d!))
    return personalSign({
        privateKey,
        data: message,
    })
}
