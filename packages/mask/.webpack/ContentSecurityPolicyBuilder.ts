// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources
enum Source {
    Self = "'self'",
    // ! Not standard CSP directive, only available in WebExtension Manifest v2
    UnsafeWASM = "'wasm-eval'",
    UnsafeEval = "'unsafe-eval'",
    ReportSample = "'report-sample'",
    None = "'none'",
    ANY_HTTPS = 'https:',
    ANY_DATA_URI = 'data:',
    ANY_BLOB_URI = 'blob:',
    ANY_MEDIA_STREAM_URI = 'mediastream:',
}
const REPORT_URI = 'https://csp-report-collector.mask-reverse-proxy.workers.dev/report?to='

const RawProdCSP = {
    'script-src': [Source.Self, Source.UnsafeWASM],
    'object-src': [Source.Self],
}
const RawProdCSP_ReportOnly = null
const RawDevCSP = {
    'script-src': [Source.Self, Source.UnsafeEval],
    'require-trusted-types-for': "'script'",
    'trusted-types': ['default', 'webpack'],
}
const RawDevCSP_ReportOnly = {
    ...RawDevCSP,
    // iframe
    // 'frame-src': Source.None,
    // 'worker-src': Source.None,
    // 'connect-src': Source.None,
    // 'default-src': Source.None,
    // 'font-src': Source.None,
    // 'img-src': Source.None,
    // 'manifest-src': Source.None,
    // 'media-src': Source.None,
    // 'object-src': Source.None,
    // 'prefetch-src': Source.None,
    // 'script-src': [Source.Self, Source.UnsafeEval],
    // 'style-src': Source.None,
    // 'base-uri': Source.None,
    // // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/sandbox
    // sandbox: 'allow-scripts',
    // 'form-action': Source.None,
    // 'frame-ancestors': Source.None,
    // 'navigate-to': Source.None,
    'report-uri': '',
    // 'require-trusted-types-for': "'script'",
    // 'trusted-types': ['default', 'webpack'],
}
export function buildCSP() {
    const version = require('../src/manifest.json').version
    const prodCSP = buildSingleCSP(RawProdCSP, REPORT_URI + version)
    const prodCSP_ReportOnly = buildSingleCSP(RawProdCSP_ReportOnly, REPORT_URI + version + '-report')
    const devCSP = buildSingleCSP(RawDevCSP, REPORT_URI + version + '-dev')
    const devCSP_ReportOnly = buildSingleCSP(RawDevCSP_ReportOnly, REPORT_URI + version + '-dev-report')

    return {
        development: { csp: devCSP, csp_report_only: devCSP_ReportOnly },
        production: { csp: prodCSP, csp_report_only: prodCSP_ReportOnly },
    }
}
function buildSingleCSP(csp: null | Record<string, string | string[]>, reportURI: string) {
    if (!csp) return null
    if ('report-uri' in csp) csp['report-uri'] = reportURI
    const entries = Object.entries(csp)
    return entries.map(([key, value]) => `${key} ${Array.isArray(value) ? value.join(' ') : value}`).join('; ')
}
