export function fetch(url: string) {
    return globalThis.fetch(url).then((x) => x.arrayBuffer())
}
