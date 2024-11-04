import { Environment, MessageTarget, WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { createI18NBundle } from '@masknet/shared-base'
import type { BasicHostHooks } from '@masknet/sandboxed-plugin-runtime'
import { i18n } from '@lingui/core'

export function createHostAPIs(isBackground: boolean): BasicHostHooks {
    let message: WebExtensionMessage<{ f: any; g: any }>
    return {
        async getPluginList() {
            const plugins = await fetch(browser.runtime.getURL('/sandboxed-modules/plugins.json'))
                .then((x) => x.json())
                .catch(() => ({}))
            // TODO: validate type of plugins here
            return Object.entries(plugins)
        },
        async fetchManifest(id: string, isLocal: boolean) {
            const prefix: string = isLocal ? 'local-plugin' : 'plugin'
            const manifestPath = `/sandboxed-modules/${prefix}-${id}/mask-manifest.json`
            const manifestURL = new URL(manifestPath, location.href)
            if (manifestURL.pathname !== manifestPath) throw new TypeError('Plugin ID is invalid.')
            return fetch(browser.runtime.getURL(manifestPath)).then((x) => x.json())
        },
        async fetchLocaleFiles(id, isLocal, languages) {
            const prefix: string = isLocal ? 'local-plugin' : 'plugin'
            const result = await Promise.allSettled(
                languages.map(async ({ url, language }) => {
                    const locales = await fetch(browser.runtime.getURL(`/sandboxed-modules/${prefix}-${id}/${url}`))
                    return { language, locales: await locales.json() }
                }),
            )
            const locales: Record<string, any> = {}
            for (const _ of result) {
                if (_.status === 'rejected') continue
                locales[_.value.language] = _.value.locales
            }
            createI18NBundle(locales)(i18n)
        },
        createRpcChannel(id, signal) {
            message ??= new WebExtensionMessage({ domain: `mask-plugin-${id}-rpc` })
            const o = message.events.f.bind(
                isBackground ? MessageTarget.Broadcast : Environment.ManifestBackground,
                signal,
            )
            return {
                send: (data) => o.send(data),
                on: (callback) => o.on((data) => callback(data)),
            }
        },
        createRpcGeneratorChannel(id, signal) {
            message ??= new WebExtensionMessage({ domain: `mask-plugin-${id}-rpc` })
            const o = message.events.g.bind(
                isBackground ? MessageTarget.Broadcast : Environment.ManifestBackground,
                signal,
            )
            return {
                send: (data) => o.send(data),
                on: (callback) => o.on((data) => callback(data)),
            }
        },
    }
}
