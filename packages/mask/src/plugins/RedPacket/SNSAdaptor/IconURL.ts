export type IconTypes = 'presentDai' | 'presentDefault' | 'presentOkb' | 'erc20Token' | 'erc721Token'

export const IconURLs: Readonly<Record<IconTypes, string>> = {
    presentDai: new URL('./assets/present-dai.png', import.meta.url).toString(),
    presentDefault: new URL('./assets/present-default.png', import.meta.url).toString(),
    presentOkb: new URL('./assets/present-okb.png', import.meta.url).toString(),
    erc20Token: new URL('./assets/erc20-token.png', import.meta.url).toString(),
    erc721Token: new URL('./assets/erc721-token.png', import.meta.url).toString(),
}
