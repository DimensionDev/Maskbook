/* eslint @dimensiondev/unicode-specific-set: ["error", { "only": "code" }] */
export const PERSONA_NAME_MAX_LENGTH = 24
export function isPersonaNameLengthValid(value: string) {
    // Array.from(string).length is not equal to string.length.
    // eslint-disable-next-line @dimensiondev/unicode-no-invisible
    // you can take 👩‍👩‍👦‍👦 as an example
    return Array.from(value).length < PERSONA_NAME_MAX_LENGTH
}
