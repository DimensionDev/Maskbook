export function hmr(hot: __WebpackModuleApi.Hot | undefined) {
    const ac = new AbortController()
    hot?.dispose(() => ac.abort())
    return {
        signal: ac.signal,
        run(callback: () => () => void) {
            try {
                ac.signal.addEventListener('abort', callback(), { once: true })
            } catch (error) {
                console.error(error)
            }
        },
    }
}
