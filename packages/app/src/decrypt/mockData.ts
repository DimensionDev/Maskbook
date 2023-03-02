import { encrypt } from '@masknet/encryption'
import { makeTypedMessageText } from '@masknet/typed-message'
import { encodeArrayBuffer } from '@masknet/kit'

export const text = encodeURIComponent(
    encodeArrayBuffer(
        (
            await encrypt(
                {
                    message: makeTypedMessageText(
                        'https://gitcoin.co/grants/159/mask-network-the-portal-to-the-new-open-internet-',
                    ),
                    network: '',
                    target: {
                        type: 'public',
                    },
                    version: -37,
                },
                {
                    deriveAESKey: null!,
                    encryptByLocalKey: null!,
                    async queryPublicKey() {
                        return null
                    },
                },
            )
        ).output as ArrayBuffer,
    ),
)
