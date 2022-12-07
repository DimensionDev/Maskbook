import type { MaskBaseAPI } from '@masknet/web3-providers/types'
import { api } from '@dimensiondev/mask-wallet-core/proto'
import { OnDemandWorker } from '@masknet/shared-base'

type Request = InstanceType<typeof api.MWRequest>
type Response = InstanceType<typeof api.MWResponse>

const Worker = new OnDemandWorker(new URL('../../../../../web-workers/wallet.ts', import.meta.url), {
    name: 'MaskWallet',
})

enum ErrorCode {
    KdfParamsInvalid = '-3001',
    PasswordIncorrect = '-3002',
    InvalidKeyIvLength = '-3003',
    InvalidCiphertext = '-3004',
    InvalidPrivateKey = '-3005',
    InvalidPublicKey = '-3006',
    InvalidMnemonic = '-3007',
    InvalidSeed = '-3008',
    InvalidDerivationPath = '-3009',
    InvalidKeyStoreJSON = '-3010',
    NotSupportedPublicKeyType = '-3011',
    NotSupportedCurve = '-3012',
    NotSupportedCipher = '-3013',
}

const ErrorMessage = {
    [ErrorCode.KdfParamsInvalid]: 'Invalid kdf parameters.',
    [ErrorCode.PasswordIncorrect]: 'Incorrect payment password.',
    [ErrorCode.InvalidKeyIvLength]: 'Invalid key IV length.',
    [ErrorCode.InvalidCiphertext]: 'Invalid cipher text.',
    [ErrorCode.InvalidPrivateKey]: 'Invalid private key.',
    [ErrorCode.InvalidPublicKey]: 'Invalid public key.',
    [ErrorCode.InvalidMnemonic]: 'Invalid mnemonic words.',
    [ErrorCode.InvalidSeed]: 'Invalid seed.',
    [ErrorCode.InvalidDerivationPath]: 'Invalid derivation path.',
    [ErrorCode.InvalidKeyStoreJSON]: 'Invalid keystore JSON.',
    [ErrorCode.NotSupportedPublicKeyType]: 'Not supported public key type.',
    [ErrorCode.NotSupportedCurve]: 'Not supported curve.',
    [ErrorCode.NotSupportedCipher]: 'Not supported cipher.',
}

function send<I extends keyof Request, O extends keyof Response>(input: I, output: O) {
    if (process.env.manifest === '3') {
        return async (value: Request[I]): Promise<Response[O]> => {
            const { request } = await import('@dimensiondev/mask-wallet-core/bundle')
            const { api } = await import('@dimensiondev/mask-wallet-core/proto')

            const payload = api.MWRequest.encode({ [input]: value }).finish()
            const wasmResult = request(payload)
            return api.MWResponse.decode(wasmResult)[output]
        }
    }
    return (value: Request[I]) => {
        return new Promise<Response[O]>((resolve, reject) => {
            const req: MaskBaseAPI.Input = { id: Math.random(), data: { [input]: value } }
            Worker.postMessage(req)
            Worker.addEventListener('message', function f(message) {
                if (message.data.id !== req.id) return

                Worker.removeEventListener('message', f)
                const data: MaskBaseAPI.Output = message.data
                if (data.response.error)
                    return reject(
                        new Error(ErrorMessage[data.response.error.errorCode as ErrorCode] || 'Unknown Error'),
                    )
                resolve(data.response[output])
            })
        })
    }
}

export const Coin = api.Coin
export const StoredKeyType = api.StoredKeyType
export const StoredKeyImportType = api.StoredKeyImportType
export const StoredKeyExportType = api.StoredKeyExportType

export const loadStoredKey = send('param_load_stored_key', 'resp_load_stored_key')
export const createStoredKey = send('param_create_stored_key', 'resp_create_stored_key')
export const importPrivateKey = send('param_import_private_key', 'resp_import_private_key')
export const importMnemonic = send('param_import_mnemonic', 'resp_import_mnemonic')
export const importJSON = send('param_import_json', 'resp_import_json')
export const createAccountOfCoinAtPath = send(
    'param_create_account_of_coin_at_path',
    'resp_create_account_of_coin_at_path',
)
export const exportPrivateKey = send('param_export_private_key', 'resp_export_private_key')
export const exportPrivateKeyOfPath = send('param_export_private_key_of_path', 'resp_export_private_key')
export const exportMnemonic = send('param_export_mnemonic', 'resp_export_mnemonic')
export const exportKeyStoreJSONOfAddress = send('param_export_key_store_json_of_address', 'resp_export_key_store_json')
export const exportKeyStoreJSONOfPath = send('param_export_key_store_json_of_path', 'resp_export_key_store_json')
export const exportUpdateKeyStorePassword = send('param_update_key_store_password', 'resp_update_key_store_password')
export const signTransaction = send('param_sign_transaction', 'resp_sign_transaction')
export const getLibVersion = send('param_get_version', 'resp_get_version')
export const validate = send('param_validation', 'resp_validate')
export const getSupportImportTypes = send('param_get_stored_key_import_type', 'resp_get_stored_key_import_type')
export const getSupportExportTypes = send('param_get_stored_key_export_type', 'resp_get_stored_key_export_type')
