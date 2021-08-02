export function getTextUILength(text: string) {
    return Array.from(text).reduce((acc, char) => acc + getCharUILength(char), 0)
}

export function sliceTextByUILength(text: string, len: number) {
    const arr = Array.from(text)
    let currentText = ''
    for (let i = 0, currentLen = 0; currentLen < len && arr[i]; currentLen += getCharUILength(arr[i]), i += 1) {
        currentText += arr[i]
    }
    return currentText
}

/**
 * Suitable for usual font styles
 * The UI width of 1 Emoji is about equal to 1 Chinese = 1 Japanese = 1.5 uppercase English = 2.5 lowercase English
 * getTextUILength('💊 良い好a ') === 11
 * Todo: extend this function to support strange typeface if needed
 */
function getCharUILength(char: string) {
    return char.charCodeAt(0) < 256 ? (char === char.toLowerCase() ? 1 : 1.5) : 2.5
}
