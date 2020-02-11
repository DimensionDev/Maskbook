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
import { decryptFromMessageWithProgress } from './extension/background-script/CryptoServices/decryptFrom'

Object.assign(window, {
    CryptoService,
    WelcomeService,
    SteganographyService,
    IdentityService,
    UserGroupService,
    PluginService,
})
Object.assign(window, {
    ServicesWithProgress: {
        decryptFrom: decryptFromMessageWithProgress,
    },
})
