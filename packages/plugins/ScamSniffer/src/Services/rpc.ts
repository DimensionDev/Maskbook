import type { Web3StorageServiceState } from '@masknet/web3-shared-base'
import type { ScamResult, PostDetail } from '@scamsniffer/detector'
import { reportScam, Detector } from '@scamsniffer/detector'

const reportKey = 'auto_report'

let detector: Detector | null = null

function initDetector() {
    if (detector === null) {
        detector = new Detector({
            onlyBuiltIn: false,
        })
    }
}

export async function enableAutoReport(enabled: boolean, storage: Web3StorageServiceState) {
    await storage.set(reportKey, enabled ? 1 : 0)
}

export async function isAutoReportEnabled(storage: Web3StorageServiceState): Promise<boolean> {
    try {
        const state = await storage.get(reportKey)
        if (state === 1) return true
    } catch (error) {}
    return false
}

export async function sendReportScam(result: ScamResult) {
    return reportScam(result)
}

export async function detectScam(post: PostDetail) {
    initDetector()
    await detector?.update()
    const result = await detector?.detectScam(post)
    return result
}
