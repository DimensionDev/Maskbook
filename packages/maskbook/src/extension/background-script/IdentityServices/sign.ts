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
import { MaskMessage } from '../../../utils'
import { Convert } from 'pvtsutils'
import { stringToBuffer } from 'arweave/web/lib/utils'
import { constructSignRequestURL } from '../../popups'
import { delay, PersonaIdentifier } from '@masknet/shared-base'
import { queryPersonasWithPrivateKey } from '../../../database/Persona/Persona.db'
export interface SignRequest {
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
export async function signWithPersona({ message, method }: SignRequest): Promise<SignRequestResult> {
    if (method !== 'eth') throw new Error('Unknown sign method')
    const requestID = Math.random().toString(16).slice(3)
    const newWindow = await browser.windows.create({
        height: 600,
        width: 400,
        type: 'popup',
        url: constructSignRequestURL({ message, requestID }),
    })
    const waitForApprove = new Promise<PersonaIdentifier>((resolve, reject) => {
        const listener = (tabID: number) => {
            if (newWindow.tabs?.[0].id === tabID) reject(new Error('Sign rejected'))
        }
        browser.tabs.onRemoved.addListener(listener)
        // reject this request after 3 mins
        delay(1000 * 60 * 3).then(() => reject(new Error('Timeout')))
        const removeListener = MaskMessage.events.signRequestApproved.on((approval) => {
            if (approval.requestID !== requestID) return
            resolve(approval.selectedPersona)
        })
        setTimeout(() => {
            waitForApprove.finally(() => {
                browser.tabs.onRemoved.removeListener(listener)
                removeListener()
                browser.windows.remove(newWindow.id!).catch(() => {})
                reject(new Error('Sign rejected'))
            })
        })
    })
    const signer = await waitForApprove
    const persona = (await queryPersonasWithPrivateKey()).find((x) => x.identifier.equals(signer))
    if (!persona) throw new Error('Persona not found')

    // will have problem with UTF-8?
    const length = message.length
    const messageHash = keccakFromString(`\x19Ethereum Signed Message:\n${length}${message}`, 256)
    const privateKey = Buffer.from(Convert.FromBase64Url(persona.privateKey.d!))
    const signature = ecsign(messageHash, privateKey)

    return {
        persona: persona.identifier,
        signature: {
            raw: signature,
            signature: toRpcSig(signature.v, signature.r, signature.s),
            EIP2098: toCompactSig(signature.v, signature.r, signature.s),
        },
        address: bufferToHex(publicToAddress(privateToPublic(privateKey))),
        messageHex: bufferToHex(Buffer.from(stringToBuffer(message))),
    }
}
