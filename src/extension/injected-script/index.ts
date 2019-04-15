import { GetContext } from '@holoflows/kit/es'
switch (GetContext()) {
    case 'content':
        const script = document.createElement('script')
        script.src = chrome.runtime.getURL('/static/js/injectedscript.js')
        script.dataset.chrome = 'true'
        document.querySelector('html')!.appendChild(script)
        break
    case 'webpage':
        require('./addEventListener')
        document.querySelector('script[data-chrome=true]')!.remove()
        console.log('Injected script loaded')
        break
}
