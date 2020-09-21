/**
 * Load service here. sorry for the ugly pattern.
 * But here's some strange problem with webpack.
 *
 * you should also add register in './extension/service.ts'
 */
import * as CryptoService from './extension/background-script/CryptoService'
import * as WelcomeService from './extension/background-script/WelcomeService'
import * as IdentityService from './extension/background-script/IdentityService'
import * as UserGroupService from './extension/background-script/UserGroupService'
import * as SteganographyService from './extension/background-script/SteganographyService'
import * as PluginService from './extension/background-script/PluginService'
import * as HelperService from './extension/background-script/HelperService'
import * as NonceService from './extension/background-script/NonceService'
import * as ProviderService from './extension/background-script/ProviderService'
import { upload as pluginArweaveUpload } from './plugins/FileService/arweave/index'
import { decryptFromText, decryptFromImageUrl } from './extension/background-script/CryptoServices/decryptFrom'
import * as EthereumService from './extension/background-script/EthereumService'
import * as TransactionService from './extension/background-script/TransactionService'
import { sendTransaction } from './extension/background-script/EthereumServices/transaction'

Object.assign(globalThis, {
    CryptoService,
    WelcomeService,
    SteganographyService,
    IdentityService,
    UserGroupService,
    PluginService,
    HelperService,
    NonceService,
    ProviderService,
    EthereumService,
    TransactionService,
})

Object.assign(globalThis, {
    ServicesWithProgress: {
        pluginArweaveUpload,
        decryptFromText,
        decryptFromImageUrl,
        sendTransaction,
    },
})
