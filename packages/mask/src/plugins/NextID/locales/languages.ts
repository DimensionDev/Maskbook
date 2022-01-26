// This file is auto generated. DO NOT EDIT
// Run `npx gulp sync-languages` to regenerate.
// Default fallback language in a family of languages are chosen by the alphabet order
// To overwrite this, please overwrite packages/scripts/src/locale-kit-next/index.ts
import en_US from './en-US.json'
export const languages = {
    en: en_US,
}
// @ts-ignore
if (import.meta.webpackHot) {
    // @ts-ignore
    import.meta.webpackHot.accept(['./en-US.json'], () =>
        globalThis.dispatchEvent?.(
            new CustomEvent('MASK_I18N_HMR', {
                detail: ['com.mask.nextid', { en: en_US }],
            }),
        ),
    )
}
