const longWasmFastPath =
    /\/\/ WebAssembly optimizations to do native i64 multiplication and divide\s+var wasm = null;\s+try \{[\s\S]*?\}\s+catch \(e\) \{[\s\S]*?\}/

module.exports = function disableLongWasmLoader(source) {
    const next = source.replace(
        longWasmFastPath,
        '// Native wasm fast path disabled by webpack to satisfy extension CSP.\nvar wasm = null;',
    )
    if (next === source) throw new Error('Could not disable long.js native wasm fast path.')
    return next
}
