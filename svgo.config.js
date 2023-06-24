export default {
    multipass: true,
    js2svg: {
        indent: 4,
        pretty: true,
    },
    plugins: [
        {
            name: 'preset-default',
            params: {
                overrides: {
                    // cleanupIds plugin can not recognize quoted url,
                    // we disable it for `pnpm svgo`.
                    cleanupIds: false,
                },
            },
        },
        'prefixIds',
        // Easy to preview with Finder
        'removeDimensions',
        {
            // Raycast can not resolve reference elements without quote,
            // with this plugin, we add quote for reference urls.
            name: 'quoteUrl',
            fn: () => {
                const nodes = []
                const unquotedUrlRe = /^url\([^'"].*?\)/
                const ignoreAttributes = ['fill']
                return {
                    element: {
                        enter: (node) => {
                            for (const key of Object.keys(node.attributes)) {
                                const value = node.attributes[key]
                                if (value?.match(unquotedUrlRe)) {
                                    nodes.push(node)
                                }
                            }
                        },
                    },
                    root: {
                        exit() {
                            nodes.forEach((node) => {
                                for (const key of Object.keys(node.attributes)) {
                                    if (ignoreAttributes.includes(key)) continue
                                    const value = node.attributes[key]
                                    if (value?.match(unquotedUrlRe)) {
                                        node.attributes[key] = value.replace(/^url\((.*?)\)/, (_, url) => {
                                            return `url('${url}')`
                                        })
                                    }
                                }
                            })
                        },
                    },
                }
            },
        },
    ],
}
