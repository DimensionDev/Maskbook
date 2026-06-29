import { basename } from 'node:path'

import { convertWasmToJs } from './wasm2js-loader.ts'

const runtimePattern = /[/\\]@splinetool[/\\]runtime[/\\]build[/\\](runtime|process|boolean|physics)\.js$/
const remoteWasm = {
    process: 'https://unpkg.com/@splinetool/modelling-wasm@0.9.342/build/process.wasm',
    boolean: 'https://unpkg.com/@splinetool/boolean-wasm@0.9.342/build/boolean.wasm',
}
const remoteWasmCache = new Map<string, Promise<Buffer>>()

function assertChanged(before: string, after: string, label: string) {
    if (before === after) throw new Error(`Spline wasm2js loader could not replace ${label}.`)
}

function wrapInstantiate(code: string, name: string) {
    return `const ${name} = (() => {\n${code}\nreturn instantiate;\n})();\n`
}

async function downloadDirect(url: string) {
    const response = await fetch(url, {
        redirect: 'follow',
    })
    if (!response.ok) {
        throw new Error(`Failed to download ${url}: HTTP ${response.status}`)
    }
    return Buffer.from(await response.arrayBuffer())
}

function download(url: string) {
    return downloadDirect(url)
}

function downloadWasm(url: string) {
    let promise = remoteWasmCache.get(url)
    if (!promise) {
        promise = download(url)
        remoteWasmCache.set(url, promise)
    }
    return promise
}

function disableNativeWasmReferences(code: string) {
    return code
        .replace(/wasmBinaryFile = "[^"]+\.wasm";/g, 'wasmBinaryFile = "wasm2js-disabled";')
        .replaceAll('new WebAssembly.RuntimeError', 'new Error')
        .replaceAll('WebAssembly.instantiateStreaming', '__maskNativeWasmInstantiateStreamingDisabled')
        .replaceAll('WebAssembly.instantiate', '__maskNativeWasmInstantiateDisabled')
}

function transformRuntime(source: string) {
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

    next = code.replace('let t=typeof WebAssembly!="object"||this.decoderConfig.type==="js",e=[];', 'let t=!0,e=[];')
    assertChanged(code, next, 'Spline Draco wasm decoder branch')
    return next
}

async function transformEmscriptenGlue(source: string, wasmUrl: string) {
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

async function transformPhysics(source: string) {
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

export default function splineWasm2JsLoader(this: import('webpack').LoaderContext<string>, source: string) {
    if (!runtimePattern.test(this.resourcePath)) return source

    const callback = this.async()
    const file = basename(this.resourcePath)

    let work: Promise<string>
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
