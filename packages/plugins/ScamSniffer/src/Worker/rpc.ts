import type { ScamResult, PostDetail } from '@scamsniffer/detector'
import { reportScam, Detector } from '@scamsniffer/detector'
import { Web3Storage } from '@masknet/web3-providers'
import { PLUGIN_ID } from '../constants.js'

const reportKey = 'auto_report'
const storage = Web3Storage.createKVStorage(PLUGIN_ID)

let detector: Detector | null = null

function getDetector() {
    if (detector === null) {
        detector = new Detector({
            onlyBuiltIn: false,
        })
    }
    return detector
}

export async function enableAutoReport(enabled: boolean) {
    await storage.set(reportKey, enabled ? 1 : 0)
}

export async function isAutoReportEnabled(): Promise<boolean> {
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
    const detector = getDetector()
    await detector.update()
    const result = await detector.detectScam(post)
    const mainType = result?.matchType.split(':')[0]
    if (mainType === 'match_by_domain_sim_days') return null
    return result
}
