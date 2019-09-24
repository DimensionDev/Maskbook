module.exports = {
    /**
     * @param {string} html
     * @param {string} src
     * @param {'head' | 'body'} position
     * @param {'before' | 'after'} position2
     */
    appendScript(html, src, position, position2) {
        if (position2 === 'before') {
            const [before, after] = html.split(`<${position}>`)
            return [before, `<${position}><script src="${src}"></script>`, after].join('')
        } else {
            const [before, after] = html.split(`</${position}>`)
            return [before, `<script src="${src}"></script></${position}>`, after].join('')
        }
    },
}
