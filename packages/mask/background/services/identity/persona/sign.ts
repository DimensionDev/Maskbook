import { v4 as uuid } from 'uuid'
import { bufferToHex, privateToPublic, publicToAddress } from 'ethereumjs-util'
import { SignTypedDataVersion, personalSign, signTypedData } from '@metamask/eth-sig-util'
import { timeout } from '@masknet/kit'
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

async function sign(identifier: ECKeyIdentifier, signer: (privateKey: Buffer) => Promise<string>) {
    const persona = (await queryPersonasWithPrivateKey()).find((x) => x.identifier === identifier)
    if (!persona) throw new Error('Persona not found')
    const privateKey = Buffer.from(fromBase64URL(persona.privateKey.d!))
    return {
        persona: identifier,
        address: bufferToHex(publicToAddress(privateToPublic(privateKey))),
        signature: await signer(privateKey),
    }
}

/**
 * Generate a signature w or w/o confirmation from user
 */
export async function signWithPersona<T>(
    { method, message, identifier }: PersonaSignRequest<T>,
    silent = false,
): Promise<PersonaSignResult> {
    const getSigner = async () => {
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

    const signer = await getSigner()

    switch (method) {
        case 'message':
            return sign(signer, async (privateKey) =>
                personalSign({
                    privateKey,
                    data: message as string,
                }),
            )
        case 'typedData':
            return sign(signer, async (privateKey) =>
                signTypedData({
                    privateKey,
                    data: JSON.parse(message as string),
                    version: SignTypedDataVersion.V4,
                }),
            )
        case 'transaction':
            const transaction = message as Transaction

            const chainId = transaction.chainId
            if (!chainId) throw new Error('Invalid chain id.')

            return sign(signer, async (privateKey) => {
                const { rawTransaction } = await Web3.createWeb3(chainId).eth.accounts.signTransaction(
                    transaction,
                    toHex(privateKey),
                )
                if (!rawTransaction) throw new Error('Failed to sign transaction.')
                return rawTransaction
            })
        default:
            throw new Error(`Unknown sign method: ${method}.`)
    }
}
