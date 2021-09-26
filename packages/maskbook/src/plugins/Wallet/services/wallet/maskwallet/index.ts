import { api } from '@dimensiondev/mask-wallet-core/proto'
import { OnDemandWorker } from '../../../../../web-workers/OnDemandWorker'
import type { Input, Output } from '../../../../../../src-workers/wallet'
type Request = InstanceType<typeof api.MWRequest>
type Response = InstanceType<typeof api.MWResponse>
const Worker = new OnDemandWorker(new URL('../../../../../../src-workers/wallet.ts', import.meta.url), {
    name: 'MaskWallet',
})

function send<I extends keyof Request, O extends keyof Response>(input: I, output: O) {
    return (value: Request[I]) => {
        return new Promise((resolve, reject) => {
            const req: Input = { id: Math.random(), data: { [input]: value } }
            Worker.postMessage(req)
            Worker.addEventListener('message', function f(message) {
                if (message.data.id !== req.id) return

                Worker.removeEventListener('message', f)
                const data: Output = message.data
                if (data.response.error) return reject(new Error(data.response.error.errorCode ?? 'Unknown Error'))
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
