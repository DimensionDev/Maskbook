import database from './blacklist.json' with { type: 'json' }

const domains = database.domains
const addresses = database.address

function getHost(url) {
    try {
        return new URL(url).host
    } catch {
        return null
    }
}

export class Detector {
    constructor(_options = {}) {}

    async checkUrlInBlacklist(url) {
        const host = getHost(url)
        return host !== null && domains.includes(host)
    }

    async checkAddressInBlacklist(address) {
        return addresses.includes(address.toLowerCase())
    }
}
