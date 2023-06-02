import { delay } from '@masknet/kit'
import { ProfileIdentifier } from '@masknet/shared-base'
import { definedSiteAdaptors } from '../../../shared/site-adaptors/definitions.js'
import { requestSiteAdaptorsPermission } from '../helper/request-permission.js'

export async function openProfilePage(network: string, userId?: string) {
    const worker = definedSiteAdaptors.get(network)
    if (!worker) return

    const url = worker?.getProfilePage?.(
        ProfileIdentifier.of(network, userId).expect(
            `${network} and ${userId} should compose a valid ProfileIdentifier`,
        ),
    )
    if (!url) return

    if (!(await requestSiteAdaptorsPermission([worker]))) return

    await delay(100)
    browser.tabs.create({ active: true, url: url.toString() })
}

export async function openShareLink(network: string, post: string) {
    const url = definedSiteAdaptors.get(network)?.getShareLinkURL?.(post)

    if (!url) return
    const width = 700
    const height = 520
    browser.windows.create({
        url: url.toString(),
        width,
        height,
        type: 'popup',
        left: getLeft(width),
        top: getTop(height),
    })
}

const screen = (globalThis as any).screen
function getLeft(width: number) {
    if (screen) return (screen.width - width) / 2
    return 200
}
function getTop(height: number) {
    if (screen) return (screen.height - height) / 2
    return 200
}
