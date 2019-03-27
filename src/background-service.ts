export default undefined
if (
    location.href === 'http://localhost:3000/' ||
    (location.protocol === 'chrome-extension:' && location.pathname === '/index.html')
) {
} else {
    require('./extension/background-script')
}
