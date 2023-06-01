import type { Events } from 'webextension-polyfill'

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/devtools/inspectedWindow/eval
export function devtoolsEval(runInContentScript: boolean) {
    return async <T>(val: TemplateStringsArray, ...args: string[]) => {
        const script = String.raw(val, ...args)
        const [result, exception] = await browser.devtools.inspectedWindow.eval(
            script,
            runInContentScript ? { useContentScriptContext: true } : undefined,
        )
        if (exception) {
            console.warn('Code run failed:', script)
            if ('isException' in exception) throw new EvalError(exception.value)
            else throw new Error((exception as any).code)
        }
        return result as T
    }
}

export function createPanel(name: string) {
    return browser.devtools.panels.create(name, '128x128.png', 'empty.html')
}

export function attachListener<T>(
    listenerObject: Events.Event<(arg: T) => void>,
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
