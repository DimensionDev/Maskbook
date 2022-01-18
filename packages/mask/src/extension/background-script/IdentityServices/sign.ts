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
import { MaskMessages } from '../../../utils'
import { delay, PersonaIdentifier, fromBase64URL, PopupRoutes } from '@masknet/shared-base'
import { queryPersonasWithPrivateKey } from '../../../../background/database/persona/db'
import { openPopupWindow } from '../HelperService'
export interface SignRequest {
    /** Use that who to sign this message. */
    identifier?: string
    /** The message to be signed. */
    message: string
    /** Use what method to sign this message? */
    method: 'eth'
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

export async function signWithPersona({ message, method, identifier }: SignRequest): Promise<SignRequestResult> {
    if (method !== 'eth') throw new Error('Unknown sign method')
    const requestID = Math.random().toString(16).slice(3)
    await openPopupWindow(PopupRoutes.PersonaSignRequest, { message, requestID, identifier })

    const waitForApprove = new Promise<PersonaIdentifier>((resolve, reject) => {
        delay(1000 * 60).then(() => reject(new Error('Timeout')))
        MaskMessages.events.personaSignRequest.on((approval) => {
            if (approval.requestID !== requestID) return
            if (!approval.selectedPersona) reject(new Error('Persona Rejected'))
            resolve(approval.selectedPersona!)
        })
    })
    const signer = await waitForApprove
    const persona = (await queryPersonasWithPrivateKey()).find((x) => x.identifier.equals(signer))
    if (!persona) throw new Error('Persona not found')

    // will have problem with UTF-8?
    const length = message.length
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
