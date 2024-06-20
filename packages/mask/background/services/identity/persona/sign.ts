import { timeout } from '@masknet/kit'
import { Signer } from '@masknet/web3-providers'
import {
    type PersonaIdentifier,
    fromBase64URL,
    PopupRoutes,
    type ECKeyIdentifier,
    type SignType,
    MaskMessages,
} from '@masknet/shared-base'
import { queryPersonasWithPrivateKey } from '../../../database/persona/web.js'
import { openPopupWindow } from '../../helper/popup-opener.js'

/**
 * Generate a signature w or w/o confirmation from user
 */
export async function signWithPersona(
    type: SignType,
    message: unknown,
    identifier?: ECKeyIdentifier,
    source?: string,
    silent = false,
): Promise<string> {
    const getIdentifier = async () => {
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
                        if (!approval.selectedPersona)
                            reject(new Error('The user refused to sign message with persona.'))
                        resolve(approval.selectedPersona!)
                    })
                }),
                60 * 1000,
                'Timeout of signing with persona.',
            )
        }
        return identifier
    }

    const identifier_ = await getIdentifier()

    // find the persona with the signer's identifier
    const persona = (await queryPersonasWithPrivateKey()).find((x) => x.identifier === identifier_)
    if (!persona?.privateKey.d) throw new Error('Persona not found')

    return Signer.sign(type, Buffer.from(fromBase64URL(persona.privateKey.d)), message)
}
