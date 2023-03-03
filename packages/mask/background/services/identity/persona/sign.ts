import { v4 as uuid } from 'uuid'
import { timeout } from '@masknet/kit'
import { Web3Signer } from '@masknet/web3-providers'
import { PersonaIdentifier, fromBase64URL, PopupRoutes, ECKeyIdentifier, SignType } from '@masknet/shared-base'
import { MaskMessages } from '../../../../shared/index.js'
import { queryPersonasWithPrivateKey } from '../../../../background/database/persona/db.js'
import { openPopupWindow } from '../../../../background/services/helper/index.js'

/**
 * Generate a signature w or w/o confirmation from user
 */
export async function signWithPersona<T>(
    type: SignType,
    message: T,
    identifier?: ECKeyIdentifier,
    silent = false,
): Promise<string> {
    const getIdentifier = async () => {
        if (!identifier || !silent) {
            const requestID = uuid()
            await openPopupWindow(PopupRoutes.PersonaSignRequest, {
                message: JSON.stringify(message),
                requestID,
                identifier: identifier?.toText(),
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

    return Web3Signer.sign(type, Buffer.from(fromBase64URL(persona.privateKey.d)), message)
}
