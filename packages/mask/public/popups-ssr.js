if (location.hash === '') location.hash = '#/personas'

if (location.hash === '#/personas') {
    console.time('[SSR] Request')
    browser.runtime.sendMessage({ type: 'popups-ssr' }).then(({ html, css }) => {
        // Hmm, React goes first
        if (document.querySelector('#root')) return
        console.timeEnd('[SSR] Request')
        console.time('[SSR] Hydrate')
        document.head.insertAdjacentHTML('beforeend', css)
        document.body.innerHTML = '<div id="root">' + html + '</div>'
    })
}

load()
async function load() {
    const html = await fetch('/popups.html').then((x) => x.text())
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    for (const script of doc.body.querySelectorAll('script')) {
        import(new URL(script.src, location.href).toString())
    }
}
// As the return value of the executeScript
undefined
