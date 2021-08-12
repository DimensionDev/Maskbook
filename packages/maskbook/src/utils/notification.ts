import { getWelcomePageURL } from '../extension/options-page/Welcome/getWelcomePageURL'

interface Props {
    title?: string
    icon?: string
    body: string
    onClick?(): void
    plugin?: string
}

export async function requestNotification(props: Props) {
    const { title, icon, body, onClick } = props
    const granted = await browser.permissions.request({ permissions: ['notifications'] })
    if (!granted) return false
    const notification = new Notification(title || 'Mask', {
        icon: icon || '128x128.png',
        body,
    })
    notification.addEventListener('click', onClick || openWelcomePage)
    return true
}

function openWelcomePage() {
    browser.tabs.create({ url: getWelcomePageURL() })
}
