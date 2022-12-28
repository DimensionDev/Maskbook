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
                message,
                requestID,
                identifier: identifier?.toText(),
            })

            return await timeout(
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
        }
        return identifier
    }

    const identifier_ = await getIdentifier()

    // find persona with signer identifier
    const persona = (await queryPersonasWithPrivateKey()).find((x) => x.identifier === identifier_)
    if (!persona) throw new Error('Persona not found')

    return Web3Signer.sign(type, Buffer.from(fromBase64URL(persona.privateKey.d!)), message)
}
