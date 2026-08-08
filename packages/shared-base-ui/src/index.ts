export * from './bom/index.js'
export * from './data/index.js'
export * from './components/index.js'
export * from './hooks/index.js'
export * from './utils/index.js'

export { addI18N as importTranslationResources, languages } from './locale/languages.js'

export { default as COUNTRIES } from './country-data.json' with { type: 'json' }
export interface COUNTRY {
    country_region: string
    iso_code: string
    dialing_code: string
}
