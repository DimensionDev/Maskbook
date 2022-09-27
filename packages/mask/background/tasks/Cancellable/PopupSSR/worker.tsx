// I'm a WebWorker!

// @ts-ignore
import { render } from './loader'
import type { PopupSSR_Props } from './type.js'

const Render: (props: PopupSSR_Props) => Promise<{
    html: string
    css: string
}> = render
export async function main(props: PopupSSR_Props): Promise<{
    html: string
    css: string
}> {
    return Render(props)
}
