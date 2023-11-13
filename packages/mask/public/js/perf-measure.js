// @ts-check
// this file is only used for module performance analyze.
;(() => {
    const regex = /^\.\/node_modules\/\.pnpm\/(?<key>[^_\/]+)/
    const npm_name_cache = Object.create(null)
    const readable_name_cache = Object.create(null)
    const IMPORT_STYLE = `color: purple;`
    const USED_BY_STYLE = `color: green;`
    const FAST_TIME_STYLE = `color: gray;`
    const MERGED_MODULE_STYLE = `color: gray;`
    const SLOW_TIME_STYLE = `color: red;`
    const TIME_STYLE = `color: brown;`
    const EMPTY = Object.freeze([])

    class Graph {
        /** @type {readonly Module[]} */
        modules
        /** @type {readonly Module[]} */
        root_or_async_or_deferred_module
        total_time = 0
        constructor() {
            const observer = new PerformanceObserver((entryList) => {
                this.#freeze()
                console.clear()

                const [entry] = entryList.getEntries()
                console.log('LCP result:', entry)
                console.log('Type measure to see the graph.\n', this)
                console.log(
                    '- Modules:',
                    this.#modules.size,
                    '\n- First module:',
                    this.#first_request,
                    '\n- Total time:',
                    this.total_time,
                    '\n- Largest contentful paint:',
                    entry.startTime,
                )
                observer.disconnect()
            })
            observer.observe({ type: 'largest-contentful-paint', buffered: false })
        }
        #finalized = false
        /** @type {Module[]} */
        #stack = []
        /** @type {Map<string, Module>} */
        #modules = new Map()
        /** @type {Map<string, Module>} */
        #root_or_async_or_deferred_module = new Map()
        /** @type {number} */
        #first_request
        #freeze() {
            this.total_time = performance.now() - this.#first_request
            this.#stack.forEach((module) => this.leave(module.module_id))
            this.#finalized = true
            this.#async_compile_info.forEach((targets, from) => {
                const from_mod = this.#modules.get(String(from))
                if (!from_mod) return
                targets.forEach((x) => this.#modules.get(x)?.add_used_by(from_mod, 'async'))
            })
            this.#defer_compile_info.forEach((targets, from) => {
                const from_mod = this.#modules.get(String(from))
                if (!from_mod) return
                targets.forEach((x) => this.#modules.get(x)?.add_used_by(from_mod, 'defer'))
            })
            this.#merge_npm_nodes()

            this.modules = module_set_to_array(this.#modules)
            this.root_or_async_or_deferred_module = module_set_to_array(this.#root_or_async_or_deferred_module)

            delete Graph.prototype.connect
            delete Graph.prototype.enter
            delete Graph.prototype.leave
            delete Graph.prototype.set_compile_info
            this.modules.forEach((x) => x.freeze())
            delete Module.prototype.freeze
        }
        /** @type {Map<string, Set<string>>} */
        #async_compile_info = new Map()
        /** @type {Map<string, Set<string>>} */
        #defer_compile_info = new Map()
        /** @param {Array<[from: string | number, asyncTarget: string[], deferTarget: string[]]>} arr */
        set_compile_info(arr) {
            if (this.#finalized) return
            for (let [name, async, defer] of arr) {
                const n = (readable_name_cache[name] ??= simplified_name(String(name)))
                if (async.length) {
                    this.#async_compile_info.has(n) || this.#async_compile_info.set(n, new Set())
                    const s = this.#async_compile_info.get(n)
                    for (const x of async) s.add((readable_name_cache[x] ??= simplified_name(String(x))))
                }
                if (defer.length) {
                    this.#defer_compile_info.has(n) || this.#defer_compile_info.set(n, new Set())
                    const s = this.#defer_compile_info.get(n)
                    for (const x of async) s.add((readable_name_cache[x] ??= simplified_name(String(x))))
                }
            }
        }
        /**
         * @private
         * @param {string} dependency
         */
        connect(dependency) {
            if (this.#finalized) return
            this.#first_request ??= performance.now()
            dependency = readable_name_cache[dependency] ??= simplified_name(dependency)
            const dep = this.#modules.get(dependency)
            const current = this.#stack.at(-1)
            if (current) {
                dep.add_used_by(current)
            } else {
                this.#root_or_async_or_deferred_module.set(dep.module_id, dep)
            }
        }
        /**
         * @private
         * @param {string} current
         */
        enter(current) {
            if (this.#finalized) return
            this.#first_request ??= performance.now()
            current = readable_name_cache[current] ??= simplified_name(current)
            const new_mod = new Module(current)
            this.#modules.set(current, new_mod)
            this.connect(current)
            this.#stack.push(new_mod)
        }
        /**
         * @private
         * @param {string} current
         */
        leave(current) {
            if (this.#finalized) return
            current = readable_name_cache[current] ??= simplified_name(current)
            const last = this.#stack.at(-1)
            if (last?.module_id !== current) {
                throw new Error(`Ord? Stack ${this.#stack.map((x) => x.module_id).join('\n')}, out: ${current}`)
            }
            last.end_time = performance.now()
            this.#stack.pop()
            this.#stack.forEach((m) => (m.child_span_time += last.end_time - last.start_time - last.child_span_time))
        }

        #merge_npm_nodes() {
            // categorize all files by their package
            /** @type {Map<string, Set<Module>>} */
            const packages = new Map()
            for (const node of this.#modules.values()) {
                const npm_name = get_module_name(node.module_id)
                if (!npm_name) continue
                if (!packages.has(npm_name)) packages.set(npm_name, new Set())
                packages.get(npm_name).add(node)
            }
            // merge internal files of npm packages
            for (const [npm_name, files] of packages) {
                // no internal file
                if (files.size === 1) continue

                /** @type {Set<Module>} */
                const entry_files = new Set()
                /** @type {Set<Module>} */
                const normal_files = new Set()
                // if a file is imported by another file outside of the module directly, it's an entry file
                for (const file of files) {
                    for (const used_by of file.used_by) {
                        if (npm_name !== get_module_name(used_by.module_id)) {
                            entry_files.add(file)
                            break
                        }
                    }
                    entry_files.has(file) || normal_files.add(file)
                }
                if (normal_files.size === 0 || entry_files.size === 0) continue
                // if there is only one entry file, we can merge all files into this one
                if (entry_files.size === 1) {
                    const [entry] = entry_files.values()
                    entry.concat_modules = new Set()
                    for (const file of normal_files) {
                        entry.concat_with(file)
                        this.#modules.delete(file.module_id)
                    }
                } else {
                    // otherwise do a DFS to search all path into this file.
                    // only merge a file when there is only 1 [dominator](https://en.wikipedia.org/wiki/Dominator_(graph_theory)) entry file.
                    for (const file of normal_files) {
                        /** @type {Set<Module>} */
                        const entry_in_tree = new Set()
                        dfs(
                            file,
                            (m) => {
                                if (m === file) return
                                if (entry_files.has(m)) {
                                    entry_in_tree.add(m)
                                    return ['continue']
                                }
                                if (entry_files.size >= 2) return ['break']
                            },
                            'used_by',
                        )
                        if (entry_in_tree.size === 1) {
                            const [entry] = entry_in_tree
                            entry.concat_with(file)
                        }
                    }
                }
            }
        }
    }
    class Module {
        module_id
        constructor(/** @type {string} */ module_id) {
            this.module_id = module_id
        }
        /** @type {Set<Module>} */
        #used_by = new Set()
        /** @type {readonly Module[]} */
        get used_by() {
            return Object.freeze([...this.#used_by.values()])
        }
        /** @type {Set<Module>} */
        #imports = new Set()
        /** @type {readonly Module[]} */
        get imports() {
            return Object.freeze([...this.#imports.values()])
        }
        /** @type {Set<Module>} */
        #defer_used_by = new Set()
        /** @type {readonly Module[]} */
        get defer_used_by() {
            return Object.freeze([...this.#defer_used_by.values()])
        }
        /** @type {Set<Module>} */
        #async_used_by = new Set()
        /** @type {readonly Module[]} */
        get async_used_by() {
            return Object.freeze([...this.#async_used_by.values()])
        }
        /** @type {Set<Module>} */
        #defer_imports = new Set()
        /** @type {readonly Module[]} */
        get defer_imports() {
            return Object.freeze([...this.#defer_imports.values()])
        }
        /** @type {Set<Module>} */
        #async_imports = new Set()
        /** @type {readonly Module[]} */
        get async_imports() {
            return Object.freeze([...this.#async_imports.values()])
        }
        /**
         * Modules that this module depends
         * @type {Set<string> | undefined}
         */
        concat_modules
        start_time = performance.now()
        end_time = NaN
        child_span_time = 0
        get self_time() {
            return this.end_time - this.start_time - this.child_span_time
        }
        add_used_by(/** @type {Module} */ module, /** @type {'normal' | 'async' | 'defer'} */ type = 'normal') {
            if (this === module) return
            if (type === 'normal') {
                this.#used_by.add(module)
                module.#imports.add(this)
            } else if (type === 'async') {
                this.#async_used_by.add(module)
                module.#async_imports.add(this)
            } else if (type === 'defer') {
                this.#defer_used_by.add(module)
                module.#defer_imports.add(this)
            }
        }
        #remove_used_by(/** @type {Module} */ module) {
            this.#used_by.delete(module)
            module.#imports.delete(this)
        }
        concat_with(/** @type {Module} */ removing_node) {
            if (removing_node === this) return
            this.concat_modules ??= new Set()
            this.concat_modules.add(removing_node.module_id)

            const imports = [...removing_node.#imports]
            const used_by = [...removing_node.#used_by]
            imports.forEach((m) => {
                m.#remove_used_by(removing_node)
                m.add_used_by(this)
            })
            used_by.forEach((m) => {
                removing_node.#remove_used_by(m)
                this.add_used_by(m)
            })
        }
        freeze() {
            Object.defineProperties(this, {
                start_time: { value: this.start_time },
                end_time: { value: this.end_time },
                self_time: { value: this.self_time },
                used_by: { value: this.used_by },
                imports: { value: this.imports },
                async_used_by: { value: module_set_to_array(this.#async_used_by) },
                async_imports: { value: module_set_to_array(this.#async_imports) },
                defer_used_by: { value: module_set_to_array(this.#defer_used_by) },
                defer_imports: { value: module_set_to_array(this.#defer_imports) },
            })
        }
    }
    function of(object, config) {
        return ['object', { object, config }]
    }
    function line(...object) {
        return ['div', {}].concat(object)
    }
    globalThis.devtoolsFormatters = [
        ...(globalThis.devtoolsFormatters || []),
        {
            header: function (m) {
                if (!(m instanceof Module)) return null
                const self_time = parseInt(m.self_time.toFixed(2))
                const total_time = parseInt((m.end_time - m.start_time).toFixed(2))

                const self_fast = self_time < 4
                const result = line(['span', self_fast ? { style: FAST_TIME_STYLE } : {}, m.module_id])

                if (self_time !== 0 || self_time !== total_time)
                    result.push(['span', { style: get_time_style(self_time) }, ' ', self_time])
                if (self_time !== total_time)
                    result.push(
                        ['span', { style: FAST_TIME_STYLE }, '/'],
                        ['span', { style: get_time_style(total_time) }, total_time, 'ms'],
                    )
                else if (self_time !== 0) result.push(['span', { style: get_time_style(self_time) }, 'ms'])

                if (m.imports.length || m.used_by.length) result.push(' (')
                if (m.used_by.length) result.push(['span', { style: USED_BY_STYLE }, `by ${m.used_by.length}`])
                if (m.imports.length && m.used_by.length) result.push(' ')
                if (m.imports.length) result.push(['span', { style: IMPORT_STYLE }, `to ${m.imports.length}`])
                if (m.imports.length || m.used_by.length) result.push(')')

                if (m.concat_modules?.size)
                    result.push(['span', { style: MERGED_MODULE_STYLE }, ` +${m.concat_modules.size} modules`])
                return result
            },
            hasBody: (m) =>
                m instanceof Module &&
                (m.used_by.length ||
                    m.imports.length ||
                    m.async_imports.length ||
                    m.async_used_by.length ||
                    m.defer_imports.length ||
                    m.defer_used_by.length),
            body: function (m, config) {
                if (!(m instanceof Module)) return null
                const level = config?.level ?? 1
                const next_config = { level: level + 1 }
                const import_style = { style: `margin-left: ${level * 1}em;${IMPORT_STYLE}` }
                const used_by_style = { style: `margin-left: ${level * 1}em;${USED_BY_STYLE}` }
                return [
                    'div',
                    {},
                    m.used_by.length && [
                        'div',
                        used_by_style,
                        'used by',
                        m.used_by.length >= 10 ?
                            line(of(m.used_by, next_config))
                        :   line(...m.used_by.map((x) => line(of(x)))),
                    ],
                    m.imports.length && [
                        'div',
                        import_style,
                        'imports',
                        m.imports.length >= 10 ?
                            line(of(m.imports, next_config))
                        :   line(...m.imports.map((x) => line(of(x)))),
                    ],
                    m.async_used_by.length && ['div', used_by_style, 'async used by', line(of(m.async_used_by))],
                    m.defer_used_by.length && ['div', used_by_style, 'defer used by', line(of(m.defer_used_by))],
                    m.async_imports.length && ['div', import_style, 'async imports', line(of(m.async_imports))],
                    m.defer_imports.length && ['div', import_style, 'defer imports', line(of(m.defer_imports))],
                ].filter(Boolean)
            },
        },
    ]
    Object.setPrototypeOf(Graph.prototype, null)
    Object.setPrototypeOf(Module.prototype, null)
    globalThis.measure = new Graph()

    function module_set_to_array(/** @type {Set<Module> | Map<any, Module>} */ set) {
        if (set.size === 0) return EMPTY
        const arr = [...set.values()]
        Object.assign(arr, Object.fromEntries(set instanceof Map ? set : arr.map((x) => [x.module_id, x])))
        Object.freeze(arr)
        return arr
    }

    /**
     * @template T
     * @param {Module} module
     * @param {(module: Module) => void | ['completion', T] | ['continue'] | ['break']} callback
     * @param {'all' | 'imports' | 'used_by'} direction
     * @returns {T | undefined}
     */
    function dfs(module, callback, direction = 'all') {
        const visited = new Set()
        const op = inner(module)
        if (op?.[0] === 'completion') return op[1]
        return undefined

        function inner(/** @type {Module} */ module) {
            visited.add(module)
            const op = callback(module)
            if (op) {
                if (op[0] === 'continue') return
                return op
            }
            if (direction !== 'used_by') {
                for (const node of module.imports) {
                    if (visited.has(node)) continue
                    inner(node)
                }
            }
            if (direction !== 'imports') {
                for (const node of module.used_by) {
                    if (visited.has(node)) continue
                    inner(node)
                }
            }
        }
    }
    /**
     * @param {string} module
     * @returns {string}
     */
    function get_module_name(module) {
        return module.startsWith('@') ?
                module.slice(0, module.indexOf('/', module.indexOf('/')))
            :   module.slice(0, module.indexOf('/'))
    }
    /**
     * @param {string} module
     */
    function simplified_name(module) {
        const npm_name = (npm_name_cache[module] ??= module.match(regex)?.groups?.key)
        if (npm_name) {
            const no_version =
                npm_name.startsWith('@') ? '@' + npm_name.split('@')[1].replace('+', '/') : npm_name.split('@')[0]
            return module.replace(new RegExp(`.+/node_modules/${no_version}`), no_version)
        } else {
            return module
        }
    }
    /**
     * @param {number} time
     */
    function get_time_style(time) {
        return (
            time > 10 ? SLOW_TIME_STYLE
            : time < 4 ? FAST_TIME_STYLE
            : TIME_STYLE
        )
    }
    undefined
})()
