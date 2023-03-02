export default {
    multipass: true,
    js2svg: {
        indent: 4,
        pretty: true,
    },
    plugins: [
        'preset-default',
        'prefixIds',
        'sortAttrs',
        // Easy to preview with Finder
        'removeDimensions',
    ],
}
