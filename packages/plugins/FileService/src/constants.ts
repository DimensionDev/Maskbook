export const META_KEY_1 = 'com.maskbook.fileservice:1'
export const META_KEY_2 = 'com.maskbook.fileservice:2'
export const META_KEY_3 = 'com.maskbook.fileservice:3'

export const MAX_FILE_SIZE = 10 * 1000 * 1000

export const LANDING_PAGE = 'https://files.r2d2.to/partner/arweave/landing-page.html'
export const RECOVERY_PAGE = 'https://fileservice.r2d2.to/recover'
export const ARWEAVE_SIGNING = 'https://service.r2d2.to/arweave-remote-signing'

export const enum RoutePaths {
    Browser = '/browser',
    FileSelector = '/selector',
    UploadFile = '/upload',
    Exit = '/exit',
    Terms = '/terms',
}

export const enum Provider {
    IPFS = 'ipfs',
    Arweave = 'arweave',
}
