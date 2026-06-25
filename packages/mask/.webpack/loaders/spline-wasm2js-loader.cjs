const { readFileSync } = require('node:fs')
const http = require('node:http')
const https = require('node:https')
const tls = require('node:tls')
const { basename, dirname, parse, join } = require('node:path')
const { URL } = require('node:url')
const { convertWasmToJs } = require('./wasm2js-loader.cjs')

const runtimePattern =
    /[/\\]@splinetool[/\\]runtime[/\\]build[/\\](runtime|process|boolean|physics)\.js$/
const remoteWasm = {
    process: 'https://unpkg.com/@splinetool/modelling-wasm@0.9.342/build/process.wasm',
    boolean: 'https://unpkg.com/@splinetool/boolean-wasm@0.9.342/build/boolean.wasm',
}
const remoteWasmCache = new Map()
const npmrcFiles = findNpmrcFiles()

function assertChanged(before, after, label) {
    if (before === after) throw new Error(`Spline wasm2js loader could not replace ${label}.`)
}

function wrapInstantiate(code, name) {
    return `const ${name} = (() => {\n${code}\nreturn instantiate;\n})();\n`
}

function findNpmrcFiles() {
    const files = []
    const seen = new Set()
    for (const start of [process.cwd(), __dirname]) {
        let dir = start
        while (true) {
            const file = join(dir, '.npmrc')
            if (!seen.has(file)) {
                seen.add(file)
                files.push(file)
            }
            const next = dirname(dir)
            if (next === dir || next === parse(dir).root) break
            dir = next
        }
    }
    return files
}

function readNpmrcProxy(url) {
    const isHttps = new URL(url).protocol === 'https:'
    for (const file of npmrcFiles) {
        let text
        try {
            text = readFileSync(file, 'utf8')
        } catch {
            continue
        }

        const values = new Map()
        for (const line of text.split(/\r?\n/)) {
            const trimmed = line.trim()
            if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) continue
            const index = trimmed.indexOf('=')
            if (index === -1) continue
            values.set(trimmed.slice(0, index).trim(), trimmed.slice(index + 1).trim())
        }

        const proxy = (isHttps && values.get('https-proxy')) || values.get('proxy')
        if (proxy) return proxy
    }
    return undefined
}

function getProxy(url) {
    const isHttps = new URL(url).protocol === 'https:'
    return (
        (isHttps ?
            process.env.HTTPS_PROXY || process.env.https_proxy || process.env.NPM_CONFIG_HTTPS_PROXY
        :   undefined) ||
        process.env.HTTP_PROXY ||
        process.env.http_proxy ||
        process.env.NPM_CONFIG_PROXY ||
        readNpmrcProxy(url)
    )
}

function collectResponse(response, resolve, reject, url, redirects) {
    if (
        response.statusCode &&
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location &&
        redirects > 0
    ) {
        response.resume()
        download(new URL(response.headers.location, url).toString(), redirects - 1).then(resolve, reject)
        return
    }

    if (response.statusCode !== 200) {
        response.resume()
        reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`))
        return
    }

    const chunks = []
    response.on('data', (chunk) => chunks.push(chunk))
    response.on('end', () => resolve(Buffer.concat(chunks)))
}

function downloadViaProxy(url, proxy, redirects) {
    return new Promise((resolve, reject) => {
        const target = new URL(url)
        const proxyUrl = new URL(proxy)

        if (proxyUrl.protocol !== 'http:') {
            reject(new Error(`Unsupported proxy protocol for wasm download: ${proxyUrl.protocol}`))
            return
        }

        const connect = http.request({
            host: proxyUrl.hostname,
            port: proxyUrl.port || 80,
            method: 'CONNECT',
            path: `${target.hostname}:${target.port || 443}`,
            headers: {
                Host: `${target.hostname}:${target.port || 443}`,
                ...(proxyUrl.username || proxyUrl.password ?
                    {
                        'Proxy-Authorization': `Basic ${Buffer.from(
                            `${decodeURIComponent(proxyUrl.username)}:${decodeURIComponent(proxyUrl.password)}`,
                        ).toString('base64')}`,
                    }
                :   {}),
            },
        })

        connect.on('connect', (response, socket) => {
            if (response.statusCode !== 200) {
                socket.destroy()
                reject(new Error(`Proxy CONNECT failed for ${url}: HTTP ${response.statusCode}`))
                return
            }

            const request = https.request(
                {
                    host: target.hostname,
                    port: target.port || 443,
                    path: `${target.pathname}${target.search}`,
                    method: 'GET',
                    headers: { 'User-Agent': 'mask-webpack-wasm2js' },
                    createConnection: () => tls.connect({ socket, servername: target.hostname }),
                },
                (downloadResponse) => collectResponse(downloadResponse, resolve, reject, url, redirects),
            )
            request.on('error', reject)
            request.end()
        })
        connect.on('error', reject)
        connect.end()
    })
}

function downloadDirect(url, redirects) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, { headers: { 'User-Agent': 'mask-webpack-wasm2js' } }, (response) =>
            collectResponse(response, resolve, reject, url, redirects),
        )
        request.on('error', reject)
    })
}

function download(url, redirects = 5) {
    const proxy = getProxy(url)
    if (proxy) return downloadViaProxy(url, proxy, redirects)
    return downloadDirect(url, redirects)
}

function downloadWasm(url) {
    let promise = remoteWasmCache.get(url)
    if (!promise) {
        promise = download(url)
        remoteWasmCache.set(url, promise)
    }
    return promise
}

function disableNativeWasmReferences(code) {
    return code
        .replace(/wasmBinaryFile = "[^"]+\.wasm";/g, 'wasmBinaryFile = "wasm2js-disabled";')
        .replaceAll('new WebAssembly.RuntimeError', 'new Error')
        .replaceAll('WebAssembly.instantiateStreaming', '__maskNativeWasmInstantiateStreamingDisabled')
        .replaceAll('WebAssembly.instantiate', '__maskNativeWasmInstantiateDisabled')
}

function transformRuntime(source) {
    let code = source

    const processLoader =
        'async function TC(){if(EC)return;let e=await import("./process.js"),i=e.default,s=await i();_C(s),EC=!0}'
    const booleanLoader =
        'async function RC(){if(IC)return;let e=await import("./boolean.js"),i=e.default,s=await i();OC(s),IC=!0}'

    let next = code.replace(
        /async function TC\(\)\{if\(EC\)return;let t=!1\?"\.":"https:\/\/unpkg\.com\/@splinetool\/modelling-wasm@0\.9\.342\/build",\[e,n\]=await Promise\.all\(\[import\("\.\/process\.js"\),fetch\(`\$\{t\}\/process\.wasm`\)\.then\(o=>o\.arrayBuffer\(\)\)\]\),i=e\.default,s=await i\(\{wasmBinary:n\}\);_C\(s\),EC=!0\}/,
        processLoader,
    )
    assertChanged(code, next, 'Spline process.wasm fetch')
    code = next

    next = code.replace(
        /async function RC\(\)\{if\(IC\)return;let t=!1\?"\.":"https:\/\/unpkg\.com\/@splinetool\/boolean-wasm@0\.9\.342\/build",\[e,n\]=await Promise\.all\(\[import\("\.\/boolean\.js"\),fetch\(`\$\{t\}\/boolean\.wasm`\)\.then\(o=>o\.arrayBuffer\(\)\)\]\),i=e\.default,s=await i\(\{wasmBinary:n\}\);OC\(s\),IC=!0\}/,
        booleanLoader,
    )
    assertChanged(code, next, 'Spline boolean.wasm fetch')
    code = next

    next = code.replace(
        'let t=typeof WebAssembly!="object"||this.decoderConfig.type==="js",e=[];',
        'let t=!0,e=[];',
    )
    assertChanged(code, next, 'Spline Draco wasm decoder branch')
    return next
}

async function transformEmscriptenGlue(source, wasmUrl) {
    const wasm = await downloadWasm(wasmUrl)
    const converted = await convertWasmToJs(wasm, { emscripten: true })

    let code =
        wrapInstantiate(converted, '__maskWasm2JsInstantiate') +
        'const __maskNativeWasmInstantiateDisabled = () => Promise.reject(new Error("Native wasm instantiation is disabled; Binaryen wasm2js output is used instead."));\n' +
        'const __maskNativeWasmInstantiateStreamingDisabled = undefined;\n' +
        source

    const nativeCheck = `    if (typeof WebAssembly !== "object") {
      abort("no native wasm support detected");
    }
`
    let next = code.replace(nativeCheck, '')
    assertChanged(code, next, 'Emscripten native wasm feature check')
    code = next

    const moduleInit = `    Module = Module || {};
`
    const moduleInitReplacement = `    Module = Module || {};
    if (!Module["instantiateWasm"]) {
      Module["instantiateWasm"] = function (info, receiveInstance) {
        var exports = __maskWasm2JsInstantiate(info);
        receiveInstance({ exports: exports });
        return exports;
      };
    }
`
    next = code.replace(moduleInit, moduleInitReplacement)
    assertChanged(code, next, 'Emscripten instantiateWasm hook')
    code = next

    return disableNativeWasmReferences(code)
}

async function transformPhysics(source) {
    const base64Match = source.match(/OI\.toByteArray\("([A-Za-z0-9+/=]+)"\)/)
    if (!base64Match) throw new Error('Spline wasm2js loader could not find the embedded physics wasm payload.')

    const converted = await convertWasmToJs(Buffer.from(base64Match[1], 'base64'), { emscripten: true })
    let code =
        wrapInstantiate(converted, '__maskWasm2JsPhysicsInstantiate') +
        'async function __maskInstantiatePhysics(imports) {\n' +
        '    return { instance: { exports: __maskWasm2JsPhysicsInstantiate(imports) }, module: null };\n' +
        '}\n' +
        source

    let next = code.replace(/OI\.toByteArray\("[A-Za-z0-9+/=]+"\)/, 'null')
    assertChanged(code, next, 'Spline embedded physics wasm payload')
    code = next

    const nativeInstantiate =
        'const{instance:w,module:a}=await async function(A,I){if("function"==typeof Response&&A instanceof Response){if("function"==typeof WebAssembly.instantiateStreaming)try{return await WebAssembly.instantiateStreaming(A,I)}catch(I){if("application/wasm"==A.headers.get("Content-Type"))throw I;console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\\n",I)}const g=await A.arrayBuffer();return await WebAssembly.instantiate(g,I)}{const g=await WebAssembly.instantiate(A,I);return g instanceof WebAssembly.Instance?{instance:g,module:A}:g}}(await I,C);'
    next = code.replace(nativeInstantiate, 'const{instance:w,module:a}=await __maskInstantiatePhysics(C);')
    assertChanged(code, next, 'Spline physics native wasm instantiate path')
    return next
}

function splineWasm2JsLoader(source) {
    if (!runtimePattern.test(this.resourcePath)) return source

    const callback = this.async()
    for (const file of npmrcFiles) this.addDependency(file)
    const file = basename(this.resourcePath)

    let work
    if (file === 'runtime.js') {
        work = Promise.resolve(transformRuntime(source))
    } else if (file === 'process.js') {
        work = transformEmscriptenGlue(source, remoteWasm.process)
    } else if (file === 'boolean.js') {
        work = transformEmscriptenGlue(source, remoteWasm.boolean)
    } else if (file === 'physics.js') {
        work = transformPhysics(source)
    } else {
        work = Promise.resolve(source)
    }

    work.then(
        (code) => callback(null, code),
        (error) => callback(error),
    )
}

module.exports = splineWasm2JsLoader
