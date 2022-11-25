export function isValidDomain(domain?: string) {
    return /.+\.sol/i.test(domain ?? '')
}
