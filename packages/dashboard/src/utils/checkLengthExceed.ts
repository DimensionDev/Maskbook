export const PERSONA_NAME_MAX_LENGTH = 24
export function isPersonaNameLengthValid(value: string) {
    // Array.from(string).length is not equal to string.length.
    // you can take 👩‍👩‍👦‍👦 as an example
    return Array.from(value).length < PERSONA_NAME_MAX_LENGTH
}
