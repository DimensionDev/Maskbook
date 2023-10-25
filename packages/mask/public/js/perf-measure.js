// @ts-check
// this file is only used for module performance analyze.
;(() => {
    const regex = /^\.\/node_modules\/\.pnpm\/(?<key>[^_\/]+)/
    const npm_name_cache = Object.create(null)
    const readable_name_cache = Object.create(null)
    const PROP_STYLE = `color: rgb(125, 31, 124);`
    const IMPORT_STYLE = `color: purple;`
    const USED_BY_STYLE = `color: green;`
    const FAST_TIME_STYLE = `color: gray;`
    const SLOW_TIME_STYLE = `color: red;`
    const TIME_STYLE = `color: brown;`
    const INDENT_1_STYLE = 'margin-left: 2em'

    class Graph {
        constructor() {
            const observer = new PerformanceObserver((entryList) => {
                this.#freeze()
                console.clear()

                const [entry] = entryList.getEntries()
                console.log('LCP result:', entry)
                console.log('Type measure to see the graph.', this)
                console.log(
                    '- Modules:',
                    this.#modules.size,
                    '\n- First module:',
                    this.first_request,
                    '\n- Total time:',
                    this.total_time,
                    '\n- Largest contentful paint:',
                    entry.startTime,
                )
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
        first_request
        /** @type {readonly Module[]} */
        modules
        /** @type {readonly Module[]} */
        root_or_async_or_deferred_module
        total_time = 0

        #freeze() {
            this.total_time = performance.now() - this.first_request
            this.#stack.forEach((module) => this.leave(module.module_id))
            this.#finalized = true
            this.#merge_npm_nodes()
            this.modules = Object.freeze([...this.#modules.values()])
            this.root_or_async_or_deferred_module = Object.freeze([...this.#root_or_async_or_deferred_module.values()])

            delete Graph.prototype.connect
            delete Graph.prototype.enter
            delete Graph.prototype.leave
            this.modules.forEach((x) =>
                Object.defineProperty(x, 'self_time', { configurable: true, writable: true, value: x.self_time }),
            )
        }
        /**
         * @private
         * @param {string} dependency
         */
        connect(dependency) {
            if (this.#finalized) return
            this.first_request ??= performance.now()
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
            this.first_request ??= performance.now()
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

        /**
         * @param {string} module
         */
        get(module) {
            return this.#modules.get(module)
        }
    }
    class Module {
        constructor(/** @type {string} */ module_id) {
            this.module_id = module_id
        }
        /**
         * Modules that depend on this
         * @type {Set<Module>}
         */
        used_by = new Set()
        /**
         * Modules that this module depends
         * @type {Set<Module>}
         */
        imports = new Set()
        /**
         * Modules that this module depends
         * @type {Set<string> | undefined}
         */
        concat_modules
        module_id
        start_time = performance.now()
        end_time = NaN
        child_span_time = 0
        get self_time() {
            return this.end_time - this.start_time - this.child_span_time
        }

        add_used_by(/** @type {Module} */ module) {
            if (this === module) return
            this.used_by.add(module)
            module.imports.add(this)
        }
        #remove_used_by(/** @type {Module} */ module) {
            this.used_by.delete(module)
            module.imports.delete(this)
        }
        concat_with(/** @type {Module} */ removing_node) {
            if (removing_node === this) return
            this.concat_modules ??= new Set()
            this.concat_modules.add(removing_node.module_id)

            removing_node.imports.forEach((m) => m.#remove_used_by(removing_node))
            removing_node.used_by.forEach((m) => removing_node.#remove_used_by(m))
        }
    }
    globalThis.devtoolsFormatters = [
        ...(globalThis.devtoolsFormatters || []),
        {
            header: (obj) =>
                obj instanceof Graph
                    ? [
                          'div',
                          {},
                          'Graph (',
                          ['object', { object: obj.modules.length }],
                          ' modules, ',
                          ['object', { object: obj.total_time }],
                          'ms)',
                      ]
                    : null,
            hasBody: () => true,
            body: function (obj, config) {
                if (!(obj instanceof Graph)) return null
                const r = obj.root_or_async_or_deferred_module
                return [
                    'div',
                    { style: INDENT_1_STYLE },
                    ['div', { style: PROP_STYLE }, 'First module run: ', ['object', { object: obj.first_request }]],
                    ['div', { style: PROP_STYLE }, 'Total time: ', ['object', { object: obj.total_time }]],
                    ['div', { style: PROP_STYLE }, 'Modules:', ['object', { object: obj.modules }]],
                    ['div', { style: PROP_STYLE }, 'Root/Async/Deferred modules:', ['object', { object: r }]],
                ]
            },
        },
        {
            header: function (m) {
                if (!(m instanceof Module)) return null
                const self_time = parseInt(m.self_time.toFixed(2))
                const total_time = parseInt((m.end_time - m.start_time).toFixed(2))

                const self_fast = self_time < 4
                const result = [
                    'div',
                    {},
                    ['span', self_fast ? { style: FAST_TIME_STYLE } : {}, m.module_id],
                    ' ',
                    ['span', { style: get_time_style(self_time) }, self_time],
                ]
                if (self_time !== total_time)
                    result.push(
                        ['span', { style: FAST_TIME_STYLE }, '/'],
                        ['span', { style: get_time_style(total_time) }, total_time, 'ms'],
                    )
                else result.push(['span', { style: get_time_style(self_time) }, 'ms'])

                if (m.imports.size || m.used_by.size) result.push(' (')
                if (m.used_by.size) result.push(['span', { style: USED_BY_STYLE }, `by ${m.used_by.size}`])
                if (m.imports.size && m.used_by.size) result.push(' ')
                if (m.imports.size) result.push(['span', { style: IMPORT_STYLE }, `to ${m.imports.size}`])
                if (m.imports.size || m.used_by.size) result.push(')')
                return result
            },
            hasBody: () => true,
            body: function (m, config) {
                if (!(m instanceof Module)) return null
                const level = config?.level ?? 1
                const next_config = { level: level + 1 }
                const import_style = { style: `margin-left: ${level * 1}em;${IMPORT_STYLE}` }
                const used_by_style = { style: `margin-left: ${level * 1}em;${USED_BY_STYLE}` }
                const import_next =
                    m.imports.size >= 10
                        ? ['object', { object: [...m.imports], config: next_config }]
                        : ['div', {}, ...[...m.imports].map((x) => ['div', {}, ['object', { object: x }]])]
                const used_by_next =
                    m.used_by.size >= 10
                        ? ['object', { object: [...m.used_by], config: next_config }]
                        : ['div', {}, ...[...m.used_by].map((x) => ['div', {}, ['object', { object: x }]])]
                return [
                    'div',
                    {},
                    m.used_by.size && ['div', used_by_style, 'used by', used_by_next],
                    m.imports.size && ['div', import_style, 'imports', import_next],
                ].filter(Boolean)
            },
        },
    ]
    Object.setPrototypeOf(Graph.prototype, null)
    Object.setPrototypeOf(Module.prototype, null)
    globalThis.measure = new Graph()

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
        return (npm_name_cache[module] ??= module.match(regex)?.groups?.key)
    }
    /**
     * @param {string} module
     */
    function simplified_name(module) {
        const npm_name = get_module_name(module)
        if (npm_name) {
            const no_version = npm_name.startsWith('@')
                ? '@' + npm_name.split('@')[1].replace('+', '/')
                : npm_name.split('@')[0]
            return module.replace(new RegExp(`.+/node_modules/${no_version}`), no_version)
        } else {
            return module
        }
    }
    /**
     * @param {number} time
     */
    function get_time_style(time) {
        return time > 10 ? SLOW_TIME_STYLE : time < 4 ? FAST_TIME_STYLE : TIME_STYLE
    }
    undefined
})()
