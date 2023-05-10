// Note: this file should import as less file as possible because it will be evaluated in the initial stage.
// therefore don't import from @masknet/shared-base but from the source directly.
import { TelemetryID } from '../../../../shared-base/src/utils/TelemetryID.js'

export async function getTelemetryID(): Promise<string> {
    const { telemetry_id } = await browser.storage.local.get('telemetry_id')
    return telemetry_id || setTelemetryID()
}

export async function setTelemetryID(sendNotification = true): Promise<string> {
    const id = Array.from(crypto.getRandomValues(new Uint8Array(40)), (i) => (i % 16).toString(16))
        .join('')
        .slice(0, 40)
    await browser.storage.local.set({ telemetry_id: id })
    if (sendNotification) {
        import('../../../shared/messages.js').then(({ MaskMessages }) => {
            MaskMessages.events.telemetryIDReset.sendToAll(id)
        })
    }
    TelemetryID.value = id
    return id
}
setTelemetryID(false)
if (import.meta.webpackHot) import.meta.webpackHot.accept()
