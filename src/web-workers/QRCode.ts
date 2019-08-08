/// <reference no-default-lib="true"/>
/// <reference lib="webworker" />

import jsQR from 'jsqr'

addEventListener('message', ev => {
    const [data, width, height] = ev.data as Parameters<typeof jsQR>

    postMessage(jsQR(data, width, height))
})
