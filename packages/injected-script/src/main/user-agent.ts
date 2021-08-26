const data: Partial<Navigator> = {
    // @ts-ignore
    __proto__: null,
    appVersion:
        '5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    userAgent:
        'Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Mobile Safari/537.36',
    vendor: 'Google Inc.',
    vendorSub: '',
    // navigator.userAgentData
}
if (location.hostname.endsWith('instagram.com')) {
    const proto = Object.getPrototypeOf(window.navigator)
    const desc = Object.getOwnPropertyDescriptors(proto)
    for (const key in desc) {
        // TODO: should this function f being xray-unwrapped?
        const f = () => data[key as keyof Navigator]
        if (key in data) desc[key].get = f
        else delete desc[key]
    }
    delete proto.userAgentData
    Object.defineProperties(proto, desc)
}
export {}
