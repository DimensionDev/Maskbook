/**
 * After the hosting DOM node removed,
 * the mutation watcher will receive the event in async
 * then unmount the React component.
 *
 * But before the unmount, JSS might update the CSS of disconnected DOM then throws error.
 * These lines of code mute this kind of error in this case.
 */
export function disableJSSDisconnectedWarning() {
    try {
        const orig = Object.getOwnPropertyDescriptor(HTMLStyleElement.prototype, 'sheet')!
        Object.defineProperty(HTMLStyleElement.prototype, 'sheet', {
            ...orig,
            get(this: HTMLStyleElement) {
                if (this.isConnected) return orig.get!.call(this)
                return { cssRules: [], insertRule() {} }
            },
        })
    } catch (e) {}
}
