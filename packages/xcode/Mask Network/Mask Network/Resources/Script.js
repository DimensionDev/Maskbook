document.querySelector('button.open-preferences').addEventListener('click', function openPreferences() {
    webkit.messageHandlers.controller.postMessage('open-preferences')
})
