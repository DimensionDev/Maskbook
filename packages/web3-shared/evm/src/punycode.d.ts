declare module 'punycode' {
    const punycode: {
        toASCII(domain: string): string
    }

    export default punycode
}
