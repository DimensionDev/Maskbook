import { useCallback, useEffect, useRef } from 'react'
import { Confetto } from './Confetto.js'
import { Sequin } from './Sequin.js'
import { confettiCount, sequinCount } from './utils.js'

// add Confetto/Sequin objects to arrays to draw them
const confetti: Confetto[] = []
const sequins: Sequin[] = []

let buttonOffsetWidth: number = 0
let buttonOffsetHeight: number = 0
let canvasWidth: number = 0
let canvasHeight: number = 0
let globalCtx: CanvasRenderingContext2D | undefined
let requestId: number | undefined
const renderConfetti = () => {
    if (globalCtx) {
        globalCtx.clearRect(0, 0, canvasWidth, canvasHeight)
        confetti.forEach((confetto, index) => {
            if (!globalCtx) return
            const width = confetto.dimensions.x * confetto.scale.x
            const height = confetto.dimensions.y * confetto.scale.y

            // move canvas to position and rotate
            globalCtx.translate(confetto.position.x, confetto.position.y)
            globalCtx.rotate(confetto.rotation)

            // update confetto "physics" values
            confetto.update()

            // get front or back fill color
            globalCtx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back

            // draw confetto
            globalCtx.fillRect(-width / 2, -height / 2, width, height)

            // reset transform matrix
            globalCtx.setTransform(1, 0, 0, 1, 0, 0)

            // clear rectangle where button cuts off
            if (confetto.velocity.y < 0) {
                globalCtx.clearRect(
                    canvasWidth / 2 - buttonOffsetWidth / 2,
                    canvasHeight / 2 + buttonOffsetHeight / 2,
                    buttonOffsetWidth,
                    buttonOffsetHeight,
                )
            }
        })

        sequins.forEach((sequin, index) => {
            if (!globalCtx) return
            // move canvas to position
            globalCtx.translate(sequin.position.x, sequin.position.y)

            // update sequin "physics" values
            sequin.update()

            // set the color
            globalCtx.fillStyle = sequin.color

            // draw sequin
            globalCtx.beginPath()
            globalCtx.arc(0, 0, sequin.radius, 0, 2 * Math.PI)
            globalCtx.fill()

            // reset transform matrix
            globalCtx.setTransform(1, 0, 0, 1, 0, 0)

            // clear rectangle where button cuts off
            if (sequin.velocity.y < 0) {
                globalCtx.clearRect(
                    canvasWidth / 2 - buttonOffsetWidth / 2,
                    canvasHeight / 2 + buttonOffsetHeight / 2,
                    buttonOffsetWidth,
                    buttonOffsetHeight,
                )
            }
        })

        // remove confetti and sequins that fall off the screen
        // must be done in separate loops to avoid noticeable flickering
        confetti.forEach((confetto, index) => {
            if (confetto.position.y >= canvasHeight) confetti.splice(index, 1)
        })
        sequins.forEach((sequin, index) => {
            if (sequin.position.y >= canvasHeight) sequins.splice(index, 1)
        })
    }

    requestId = window.requestAnimationFrame(renderConfetti)
}

export function useConfettiExplosion() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const resize = () => {
            const canvas = canvasRef.current
            if (!canvas) return
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener('resize', resize)
        renderConfetti()
        return () => {
            if (requestId) window.cancelAnimationFrame(requestId)
            window.removeEventListener('resize', resize)
        }
    }, [])

    const showConfettiExplosion = useCallback((width: number, height: number) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        // TODO: ??? global state?

        buttonOffsetWidth = width
        buttonOffsetHeight = height
        canvasWidth = canvas.width
        canvasHeight = canvas.height
        globalCtx = ctx
        for (let i = 0; i < confettiCount; i += 1) {
            confetti.push(new Confetto(canvas.width, canvas.height, width, height))
        }
        for (let i = 0; i < sequinCount; i += 1) {
            sequins.push(new Sequin(canvas.width, canvas.height, width, height))
        }
    }, [])

    return {
        showConfettiExplosion,
        canvasRef,
    }
}
