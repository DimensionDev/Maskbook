browser.runtime.sendMessage({ type: 'popups-ssr' }).then(({ html, css }) => {
    document.head.insertAdjacentHTML('beforeend', css)
    document.body.innerHTML = '<div id="app">' + html + '</div>'
})

// As the return value of the executeScript
undefined
