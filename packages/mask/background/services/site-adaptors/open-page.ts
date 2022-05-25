import { delay } from '@dimensiondev/kit'
import { ProfileIdentifier } from '@masknet/shared-base'
import { definedSiteAdaptors } from '../../../shared/site-adaptors/definitions'
import { requestSiteAdaptorsPermission } from '../helper/request-permission'

export async function openProfilePage(network: string, userId?: string) {
    const worker = definedSiteAdaptors.get(network)
    if (!worker) return

    const url = worker?.getProfilePage?.(ProfileIdentifier.of(network, userId).unwrap())
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
        left: (screen.width - width) / 2,
        top: (screen.height - height) / 2,
    })
}
