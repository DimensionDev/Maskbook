export const CryptoKeyRegistry = {
    test(x: any) {
        return x instanceof CryptoKey && x.extractable
    },
    async replaceAsync(key: CryptoKey) {
        return {
            raw: await crypto.subtle.exportKey('raw', key),
            algorithm: key.algorithm,
            usages: key.usages,
        }
    },
    reviveAsync({ raw, algorithm, usages }: any) {
        return crypto.subtle.importKey('raw', raw, algorithm, true, usages)
    },
}
