// DO NOT CHANGE! import from folder instead of package directly
// because we need as less as possible files to be imported.

// All imports must be deferred. This file loads in the very early stage.

import * as base /* webpackDefer: true */ from '@masknet/shared-base'
import { TelemetryID } from '../../../../shared-base/src/Telemetry/index.js'

import.meta.webpackHot?.accept()

export async function getTelemetryID(): Promise<string> {
    const { telemetry_id } = await browser.storage.local.get('telemetry_id')
    return telemetry_id || setTelemetryID()
}

export async function setTelemetryID(sendNotification = true): Promise<string> {
    const id = Array.from(crypto.getRandomValues(new Uint8Array(40)), (i) => (i % 16).toString(16))
        .join('')
        .slice(0, 40)
    try {
        await browser.storage.local.set({ telemetry_id: id })
    } catch {}

    if (sendNotification) base.MaskMessages.events.telemetryIDReset.sendToAll(id)

    TelemetryID.value = id
    return id
}
