import { AutomatedTabTask, GetContext } from '@holoflows/kit'
import { ProfileIdentifier, ECKeyIdentifier, Identifier } from '../../database/type'
import {
    disableOpenNewTabInBackgroundSettings,
    currentImmersiveSetupStatus,
    ImmersiveSetupCrossContextStatus,
} from '../../components/shared-settings/settings'
import { SocialNetworkUI } from '../../social-network/ui'
import { memoizePromise } from '../../utils/memoize'
import { safeGetActiveUI } from '../../utils/safeRequire'

function getActivatedUI() {
    return safeGetActiveUI()
}

const _tasks = {
    getPostContent: () => getActivatedUI().taskGetPostContent(),
    /**
     * Access profile page
     * Get Profile
     */
    getProfile: (identifier: ProfileIdentifier) => getActivatedUI().taskGetProfile(identifier),
    /**
     * Access profile page
     * Paste text into bio
     */
    pasteIntoBio: async (text: string) => getActivatedUI().taskPasteIntoBio(text),
    /**
     * Access main page
     * Paste text into PostBox
     */
    pasteIntoPostBox: async (text: string, options: Parameters<SocialNetworkUI['taskPasteIntoPostBox']>[1]) =>
        getActivatedUI().taskPasteIntoPostBox(text, options),
    /**
     * Fetch a url in the current context
     */
    async fetch(...args: Parameters<typeof fetch>) {
        return fetch(...args).then(x => x.text())
    },
    memoizeFetch: memoizePromise(
        url => {
            return fetch(url).then(x => x.text())
        },
        x => x,
    ),
    async immersiveSetup(for_: ECKeyIdentifier) {
        getActivatedUI().taskStartImmersiveSetup(for_)
    },
}
const realTasks = AutomatedTabTask(_tasks, { memorable: true })!
export default function tasks(...args: Parameters<typeof realTasks>) {
    const [tabIdOrUri, options] = args
    if (disableOpenNewTabInBackgroundSettings.value && Number.isNaN(Number(tabIdOrUri))) {
        if (!options || !options.active)
            throw new Error(
                `You have disabled "Disable fetching public keys in the background" in the settings so Maskbook can not perform this action`,
            )
    }
    // in the background
    if (realTasks) return realTasks(...args)
    // for debug purpose
    return _tasks
}
setTimeout(() => {
    if (GetContext() !== 'content') return
    const x = getActivatedUI().networkIdentifier
    const id = currentImmersiveSetupStatus[x].value
    const onStatusUpdate = (id: string) => {
        const status: ImmersiveSetupCrossContextStatus = JSON.parse(id || '{}')
        if (status.persona && status.status === 'during') {
            _tasks.immersiveSetup(
                Identifier.fromString(status.persona, ECKeyIdentifier).unwrap('Cant cast to ECKeyIdentifier'),
            )
        }
    }
    currentImmersiveSetupStatus[x].addListener(onStatusUpdate)
    onStatusUpdate(id)
}, 200)
