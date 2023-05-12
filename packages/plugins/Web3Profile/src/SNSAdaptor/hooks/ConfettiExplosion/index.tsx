import { useCallback, useEffect, useRef } from 'react'
import { Confetto } from './Confetto.js'
import { Sequin } from './Sequin.js'
import { confettiCount, sequinCount } from './utils.js'

// add Confetto/Sequin objects to arrays to draw them
const confetti: Confetto[] = []
const sequins: Sequin[] = []

const renderConfetti = (
    buttonOffsetWidth: number,
    buttonOffsetHeight: number,
    canvasWidth: number,
    canvasHeight: number,
    ctx: CanvasRenderingContext2D,
) => {
    if (!ctx) return
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    confetti.forEach((confetto, index) => {
        const width = confetto.dimensions.x * confetto.scale.x
        const height = confetto.dimensions.y * confetto.scale.y

        // move canvas to position and rotate
        ctx.translate(confetto.position.x, confetto.position.y)
        ctx.rotate(confetto.rotation)

        // update confetto "physics" values
        confetto.update()

        // get front or back fill color
        ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back

        // draw confetto
        ctx.fillRect(-width / 2, -height / 2, width, height)

        // reset transform matrix
        ctx.setTransform(1, 0, 0, 1, 0, 0)

        // clear rectangle where button cuts off
        if (confetto.velocity.y < 0) {
            ctx.clearRect(
                canvasWidth / 2 - buttonOffsetWidth / 2,
                canvasHeight / 2 + buttonOffsetHeight / 2,
                buttonOffsetWidth,
                buttonOffsetHeight,
            )
        }
    })

    sequins.forEach((sequin, index) => {
        // move canvas to position
        ctx.translate(sequin.position.x, sequin.position.y)

        // update sequin "physics" values
        sequin.update()

        // set the color
        ctx.fillStyle = sequin.color

        // draw sequin
        ctx.beginPath()
        ctx.arc(0, 0, sequin.radius, 0, 2 * Math.PI)
        ctx.fill()

        // reset transform matrix
        ctx.setTransform(1, 0, 0, 1, 0, 0)

        // clear rectangle where button cuts off
        if (sequin.velocity.y < 0) {
            ctx.clearRect(
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
    window.requestAnimationFrame(() => {
        renderConfetti(buttonOffsetWidth, buttonOffsetHeight, canvasWidth, canvasHeight, ctx)
    })
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
        return () => {
            window.removeEventListener('resize', resize)
        }
    }, [])

    const showConfettiExplosion = useCallback((buttonOffsetWidth: number, buttonOffsetHeight: number) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        for (let i = 0; i < confettiCount; i += 1) {
            confetti.push(new Confetto(canvas.width, canvas.height, buttonOffsetWidth, buttonOffsetHeight))
        }
        for (let i = 0; i < sequinCount; i += 1) {
            sequins.push(new Sequin(canvas.width, canvas.height, buttonOffsetWidth, buttonOffsetHeight))
        }

        renderConfetti(buttonOffsetWidth, buttonOffsetHeight, canvas.width, canvas.height, ctx)
    }, [])

    return {
        showConfettiExplosion,
        canvasRef,
    }
}
