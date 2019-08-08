// ! find a easy way for using DOM context and worker context separeatly
// ! then we can remove @ts-ignore here and make worker type safe
import jsQR from 'jsqr'

// @ts-ignore
addEventListener('message', ev => {
    const [data, width, height] = ev.data as Parameters<typeof jsQR>

    // @ts-ignore
    postMessage(jsQR(data, width, height))
})
