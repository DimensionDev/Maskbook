import { Detector } from '@scamsniffer/detector'

let detector: Detector | null = null

function getDetector() {
    if (detector === null) {
        detector = new Detector({
            onlyBuiltIn: false,
        })
    }
    return detector
}

export async function checkUrl(url: string) {
    const detector = getDetector()
    return detector.checkUrlInBlacklist(url)
}

export async function checkAddress(address: string) {
    const detector = getDetector()
    const result = await detector.checkAddressInBlacklist(address)
    return !!result
}
