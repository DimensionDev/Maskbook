export function isValidDomain(domain?: string) {
    return /.\.(?:sns|sol)$/iu.test(domain ?? '')
}
