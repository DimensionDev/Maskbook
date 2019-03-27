export default undefined
if (location.href === 'http://localhost:3000/' || location.protocol === 'chrome-extension:') {
} else {
    import('./extension/content-script/index')
}
