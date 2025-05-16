export function isValidDomain(domain?: string) {
    return /.\.sol/iu.test(domain ?? '')
}
