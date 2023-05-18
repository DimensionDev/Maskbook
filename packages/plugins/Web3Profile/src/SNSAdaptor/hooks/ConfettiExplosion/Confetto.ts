import { colors, dragConfetti, gravityConfetti, initConfettoVelocity, randomRange, terminalVelocity } from './utils.js'

export class Confetto {
    randomModifier: number
    color: { front: string; back: string }
    dimensions: { x: number; y: number }
    position: { x: number; y: number }
    rotation: number

    scale = { x: 1, y: 1 }
    velocity = initConfettoVelocity([-9, 9], [6, 11])

    constructor(canvasWidth: number, canvasHeight: number, buttonOffsetWidth: number, buttonOffsetHeight: number) {
        this.randomModifier = randomRange(0, 99)

        this.color = colors[Math.floor(randomRange(0, colors.length))]

        this.dimensions = {
            x: randomRange(5, 9),
            y: randomRange(8, 15),
        }

        this.position = {
            x: randomRange(canvasWidth / 2 - buttonOffsetWidth / 4, canvasWidth / 2 + buttonOffsetWidth / 4),
            y: randomRange(
                canvasHeight / 2 + buttonOffsetHeight / 2 + 8,
                canvasHeight / 2 + 1.5 * buttonOffsetHeight - 8,
            ),
        }

        this.rotation = randomRange(0, 2 * Math.PI)
    }

    public update() {
        // apply forces to velocity
        this.velocity.x -= this.velocity.x * dragConfetti
        this.velocity.y = Math.min(this.velocity.y + gravityConfetti, terminalVelocity)
        this.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random()

        // set position
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        // spin confetto by scaling y and set the color, .09 just slows cosine frequency
        this.scale.y = Math.cos((this.position.y + this.randomModifier) * 0.09)
    }
}
