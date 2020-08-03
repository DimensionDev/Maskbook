import * as React from 'react'
import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useAsync } from 'react-use'
import Services from '../../extension/service'
import { Skeleton, SkeletonProps } from '@material-ui/lab'
export interface ImageProps {
    children?: never
    src: string | Blob
    /**
     * Where should the request be sent?
     * `current` means the origin of the current page (which means might be blocked by CSP policy)
     *
     * `extension` means the request will be sent in the `chrome-extension://` protocol. You need to have the permission to the target site or the site has configured CORS policy correctly.
     *
     * `auto` means this component will try to decide this based on "src" property
     *
     * @default auto
     */
    origin?: 'current' | 'extension' | 'auto'
    /**
     * Which tag should be used to render the image?
     *
     * - `img` is ignored when `src` is ArrayBuffer.
     *
     * - `img` is ignored when `origin` is `extension`.
     * @default auto
     */
    component?: 'img' | 'canvas'
    width: number
    height: number
    loading?: boolean
    // usability
    canvasProps?: React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>
    imgProps?: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
    SkeletonProps?: SkeletonProps
    className?: string
    style?: React.CSSProperties
}

type ForwardingRef = {
    img?: HTMLImageElement | null
    canvas?: HTMLCanvasElement | null
}

// TODO support concurrent mode
/**
 * This React Component is used to render images in the content script to bypass the CSP restriction.
 */
export const Image = forwardRef<ForwardingRef, ImageProps>(function Image(props, outgoingRef) {
    const { src, loading: propsLoading, canvasProps, imgProps, style, className, SkeletonProps } = props
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas#Maximum_canvas_size
    const [height, width] = [Math.min(32767, props.height), Math.min(32767, props.width)]
    const [origin, component] = resolveMode(props)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    useImperativeHandle(outgoingRef, () => ({ canvas: canvasRef.current, img: imgRef.current }), [
        canvasRef.current,
        imgRef.current,
    ])

    // TODO: handle image loading error
    const { loading, error, value } = useAsync(
        async function () {
            if (propsLoading) return
            if (component === 'img') return
            if (typeof src !== 'string') return
            if (origin === 'current') return fetch(src).then((x) => x.blob())
            return Services.Helper.fetch(src)
        },
        [component, src, origin],
    )
    if (error) console.error(error)

    useEffect(() => {
        const e = canvasRef.current
        if (!e) return
        if (!(e instanceof HTMLCanvasElement)) return
        if (propsLoading || loading) return
        if (component !== 'canvas') return
        const source = src instanceof Blob ? src : value!
        if (!source) return
        toImage(source).then((data) => {
            const ctx = e.getContext('2d')!
            ctx.drawImage(data, 0, 0, width * window.devicePixelRatio, height * window.devicePixelRatio)
        })
    }, [canvasRef.current, propsLoading, loading, value, component, width, height, src])

    if (propsLoading || loading) {
        return (
            <Skeleton
                variant="rect"
                width={width}
                height={height}
                className={className}
                style={style}
                {...SkeletonProps}
            />
        )
    }
    if (component === 'img' && typeof src === 'string') {
        return (
            <img
                src={src}
                width={width}
                height={height}
                className={className}
                style={style}
                ref={imgRef}
                {...imgProps}
            />
        )
    }
    return (
        <canvas
            ref={canvasRef}
            width={width * window.devicePixelRatio}
            height={height * window.devicePixelRatio}
            style={{ width, height, ...style }}
            className={className}
            {...canvasProps}
        />
    )
})
function resolveMode(
    props: ImageProps,
): [Exclude<NonNullable<ImageProps['origin']>, 'auto'>, NonNullable<ImageProps['component']>] {
    const { src, component = 'img', origin = 'auto' } = props
    if (typeof src !== 'string') return ['current', 'canvas']
    if (origin === 'extension') return ['extension', 'canvas']
    if (origin === 'auto') {
        if (isSameOrigin(src)) return ['current', component]
        return ['extension', 'canvas']
    }
    return [origin, component]
}
function isSameOrigin(x: unknown) {
    if (typeof x !== 'string') return false
    try {
        if (new URL(location.href).origin === new URL(x).origin) return true
    } catch {}
    return false
}
async function toImage(arr: ImageBitmapSource): Promise<CanvasImageSource> {
    try {
        return await createImageBitmap(arr)
    } catch {
        // Safari route
        return new Promise<CanvasImageSource>((resolve, reject) => {
            const img = document.createElement('img')
            img.addEventListener('load', function () {
                resolve(this)
                URL.revokeObjectURL(img.src)
            })
            img.addEventListener('error', (e) => {
                reject(e)
                URL.revokeObjectURL(img.src)
            })
            // TODO: this might be blocked by CSP
            img.src = URL.createObjectURL(arr)
        })
    }
}
