import { timeout } from '@masknet/kit'
import { Signer } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import {
    type PersonaIdentifier,
    fromBase64URL,
    PopupRoutes,
    type ECKeyIdentifier,
    MaskMessages,
    type SignMessage,
} from '@masknet/shared-base'
import { queryPersonasWithPrivateKey } from '../../../database/persona/web.js'
import { openPopupWindow } from '../../helper/popup-opener.js'

async function getIdentifier(message: unknown, identifier?: ECKeyIdentifier, source?: string, silent = false) {
    if (!identifier || !silent) {
        const requestID = crypto.randomUUID()
        await openPopupWindow(PopupRoutes.PersonaSignRequest, {
            message: JSON.stringify(message),
            requestID,
            identifier: identifier?.toText(),
            source,
        })

        return timeout(
            new Promise<PersonaIdentifier>((resolve, reject) => {
                MaskMessages.events.personaSignRequest.on((approval) => {
                    if (approval.requestID !== requestID) return
                    if (!approval.selectedPersona) reject(new Error('The user refused to sign message with persona.'))
                    resolve(approval.selectedPersona!)
                })
            }),
            60 * 1000,
            'Timeout of signing with persona.',
        )
    }
    return identifier
}
/**
 * Generate a signature w or w/o confirmation from user
 */
export async function signWithPersona(
    message: SignMessage,
    identifier?: ECKeyIdentifier,
    origin?: string,
    silent = false,
    chainId?: ChainId,
): Promise<string> {
    identifier = await getIdentifier(message.data, identifier, origin, silent)

    // find the persona with the signer's identifier
    const persona = (await queryPersonasWithPrivateKey()).find((x) => x.identifier === identifier)
    if (!persona?.privateKey.d) throw new Error('Persona not found')

    return Signer.sign(message, Buffer.from(fromBase64URL(persona.privateKey.d)), chainId)
}
