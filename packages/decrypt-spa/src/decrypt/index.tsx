import { DecryptError, DecryptErrorReasons } from '@masknet/encryption'
import type { TypedMessage } from '@masknet/typed-message'
import { useEffect, useState } from 'react'
import { decrypt, parsePayloadBinary, parsePayloadText } from './decrypt.js'
import { createTypedMessageRenderRegistry, RegistryContext, TypedMessageRender } from '@masknet/typed-message-react'

const registry = createTypedMessageRenderRegistry()
export default function Decryption() {
    const [error, isE2E, message] = useDecryption()
    if (isE2E) {
        return (
            <>This message is a end-to-end encrypted message. We does not have enough information to decrypt it here.</>
        )
    }
    if (error) {
        console.error(error)
        return <>We encountered an error when try to decrypt this message: {error.message}</>
    }
    if (!message) return <>Decrypting...</>
    return (
        <>
            Decrypted message:
            <RegistryContext.Provider value={registry.getTypedMessageRender}>
                <TypedMessageRender message={message} />
            </RegistryContext.Provider>
        </>
    )
}

function useDecryption() {
    const [message, setMessage] = useState<TypedMessage | null>(null)
    const [isE2E, setIsE2E] = useState<boolean>(false)
    const [error, setError] = useState<DecryptError | null>(null)
    useEffect(() => {
        main(
            '1',
            '4/4.0e6cerJUeGR9mJl3/kHJA7qbbVebTIpGweiOmLROAHmT0qd4/gy35N7vu9W7kEjegJYjkCI2ASNAaL57QEE0nKLG4knBK32WoayV/BPqYcb-F9hXiJSYFZsEVbUEBt8ALqJo9Xfpa0dM/ggyyUWhGjTENKzv1ll3dZvWjxYUKp5orLrq7OUceaPm.I5//o7fgXmimLD/Uul4LkA_=.f3X2TF9+6ENaebbZeHdKhEg1NE1zI7wZvC795jQ+jBT/Si5EhOS0ICSUdQySunQVQ2upnl1s/vfQ1IZNCscipnckGcIsBVAcXfK9FQgKzgPNrfzKqDgq/3miQt3Twg2699Hzzwfq+2O+yWNrPxfjYA+DDf6jijeHE7h/+QUGEkeODpqBeXTIQGh2F80VjADjK/u67REUKJQtoMVzMALR5Jr0kamoBuC6YLecV6jhvF2/LLE4Gm+SQDUwwWgg+y4DNQpNZBbuebqUqOctjFibxFopV8nnm07nimLiTZX4uhdp6g0Z6H/eYi8BkQQv1nIdJ/cANbNn12NC2DyxupcEJbtZRBQtJ05xv9ot2oWs+MnDCE4o8T58WZHwEvh5Pjl7qFhG59WxQMXelqJlUQFl5mQwiwX9gKE9sOZNPHP5WiI9cw0Kn3PQMhMBT1GdQ9/IDXfFQrGaGS6TcK6ROHE2HBFH2JE6Ua5u2qEsZTWZDEy/WNGqNESAfRK/NDC1puu+jveR4xbUt9mNzo9NxFS0Mr4Iz+8UdiHyYoU4KYet8eusqZN8Wc7LzbQebS5nVAEoSslafJfKE5Yjxp5YfhEZZ4oLwOLk2+Z8Ae8KMJ15s3fg0w==._.A6eLMaM6BVcUo9Ir6TfNJ4U6V8xT7ydDIpCMKJ6c5cAT.1.dHdpdHRlci5jb20vV2VuTHVvNjYzMjExMTUz%40',
        ).then((result) => {
            if (typeof result === 'boolean')
                return setError(new DecryptError(DecryptErrorReasons.PayloadBroken, undefined))
            else if (result instanceof DecryptError) {
                if (result.message === DecryptErrorReasons.PrivateKeyNotFound) setIsE2E(true)
                else setError(result)
            } else setMessage(result)
        })
    }, [])

    return [error, isE2E, message] as const
}

/**
 * @returns false: does not contain valid payload
 */
async function main(version: string, data: string): Promise<false | TypedMessage | DecryptError> {
    if (version !== '1' && version !== '2') return false

    const payload = version === '1' ? await parsePayloadText(data) : await parsePayloadBinary(data)
    if (!payload) return false

    if (payload.encryption.ok && payload.encryption.val.type === 'E2E')
        return new DecryptError(DecryptErrorReasons.PrivateKeyNotFound, undefined)

    return decrypt(data, payload)
}
