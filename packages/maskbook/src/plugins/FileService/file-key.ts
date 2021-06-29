export function makeFileKey(length = 16) {
    let key = ''
    const table = 'ABDEFGHJKMNPQRTWXYadefhijkmnprstuvwxyz03478'
    for (let i = 0; i < length; i += 1) {
        key += table.charAt(Math.floor(Math.random() * table.length))
    }
    return key
}
