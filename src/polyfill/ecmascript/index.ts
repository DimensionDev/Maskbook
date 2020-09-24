/**
 * We're targeting syntax and libraries to ES2020.
 *
 * Fell free to add polyfill (or install it from npm).
 * For proposals, stage 2 or higher can be considered.
 */
import './es2020'
/**
 * Intl APIs are separate from the language features: (last updated 8/4/2020)
 *
 * Here is the missing APIs:
 * Intl.DisplayNames (Firefox, Safari)
 * Intl.ListFormat (Safari 11.2 ~ 13)
 * Intl.Locale (Firefox for Android)
 * Intl.RelativeTimeFormat (Safari)
 * Intl.PluralRules (Safari 11.2 ~ 12)
 */
import './Intl'
