export function checkUppercase(code: number) {
    // 'A' <= code <= 'Z'
    return code >= 0x41 && code <= 0x5a
}

export function checkLowercase(code: number) {
    // 'a' <= code <= 'z'
    return code >= 0x61 && code <= 0x7a
}

export function checkNumber(code: number) {
    // '0' <= code <= '9'
    return code >= 0x30 && code <= 0x39
}
