// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/devtools/inspectedWindow/eval
export async function devtoolsEval<T>(script: string, runInContentScript: boolean): Promise<T> {
    const [result, exception] = await browser.devtools.inspectedWindow.eval(
        script,
        // @ts-expect-error
        runInContentScript ? { useContentScriptContext: true } : undefined,
    )
    if (exception) {
        if ('isException' in exception) throw new EvalError(exception.value)
        else throw new Error(exception.code)
    }
    return result
}

export function createPanel(name: string) {
    return browser.devtools.panels.create(name + ' (\u{1F3AD})', '128x128.png', 'empty.html')
}

export function attachListener<T>(
    listenerObject: Listener<T>,
    f: (arg: T) => void,
    options: Pick<AddEventListenerOptions, 'once' | 'signal'>,
) {
    if (options.once) {
        f = (arg) => {
            listenerObject.removeListener(f)
            f(arg)
        }
    }
    listenerObject.addListener(f)
    options.signal?.addEventListener('abort', () => listenerObject.removeListener(f), { once: true })
}
