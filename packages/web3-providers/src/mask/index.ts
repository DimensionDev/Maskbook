import { OnDemandWorker } from '@masknet/shared-base'
import { api } from '@dimensiondev/mask-wallet-core/proto'
import type { MaskBaseAPI } from '..'

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

const worker = new OnDemandWorker('./worker.ts')

function send<I extends keyof MaskBaseAPI.Request, O extends keyof MaskBaseAPI.Response>(input: I, output: O) {
    return (value: MaskBaseAPI.Request[I]) => {
        return new Promise<MaskBaseAPI.Response[O]>((resolve, reject) => {
            const req: MaskBaseAPI.Input = { id: Math.random(), data: { [input]: value } }
            const f = (message: any) => {
                if (message.data.id !== req.id) return

                worker.removeEventListener('message', f)
                const data: MaskBaseAPI.Output = message.data
                if (data.response.error)
                    return reject(
                        new Error(ErrorMessage[data.response.error.errorCode as ErrorCode] || 'Unknown Error'),
                    )
                resolve(data.response[output])
            }
            worker.postMessage(req)
            worker.addEventListener('message', f)
        })
    }
}

export class MaskAPI implements MaskBaseAPI.Provider {
    Coin = api.Coin
    StoredKeyType = api.StoredKeyType
    StoredKeyImportType = api.StoredKeyImportType
    StoredKeyExportType = api.StoredKeyExportType

    public loadStoredKey = send('param_load_stored_key', 'resp_load_stored_key')
    public createStoredKey = send('param_create_stored_key', 'resp_create_stored_key')
    public importPrivateKey = send('param_import_private_key', 'resp_import_private_key')
    public importMnemonic = send('param_import_mnemonic', 'resp_import_mnemonic')
    public importJSON = send('param_import_json', 'resp_import_json')
    public createAccountOfCoinAtPath = send(
        'param_create_account_of_coin_at_path',
        'resp_create_account_of_coin_at_path',
    )
    public exportPrivateKey = send('param_export_private_key', 'resp_export_private_key')
    public exportPrivateKeyOfPath = send('param_export_private_key_of_path', 'resp_export_private_key')
    public exportMnemonic = send('param_export_mnemonic', 'resp_export_mnemonic')
    public exportKeyStoreJSONOfAddress = send('param_export_key_store_json_of_address', 'resp_export_key_store_json')
    public exportKeyStoreJSONOfPath = send('param_export_key_store_json_of_path', 'resp_export_key_store_json')
    public exportUpdateKeyStorePassword = send('param_update_key_store_password', 'resp_update_key_store_password')
    public signTransaction = send('param_sign_transaction', 'resp_sign_transaction')
    public getLibVersion = send('param_get_version', 'resp_get_version')
    public validate = send('param_validation', 'resp_validate')
    public getSupportImportTypes = send('param_get_stored_key_import_type', 'resp_get_stored_key_import_type')
    public getSupportExportTypes = send('param_get_stored_key_export_type', 'resp_get_stored_key_export_type')
}
