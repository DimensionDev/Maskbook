import { MaskLoadingButton } from '../../src'

function delay(time: number) {
    return new Promise(function (resolve) {
        setTimeout(resolve.bind(null), time)
    })
}
const f = () => delay(3000)
export function LoadingButtonExample() {
    return <MaskLoadingButton onClick={f}>Click Me</MaskLoadingButton>
}
