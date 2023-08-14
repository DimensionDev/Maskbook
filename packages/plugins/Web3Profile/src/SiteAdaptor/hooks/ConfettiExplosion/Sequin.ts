import { colors, dragSequins, gravitySequins, randomRange } from './utils.js'

export class Sequin {
    color: string
    radius: number
    position: { x: number; y: number }

    velocity = {
        x: randomRange(-6, 6),
        y: randomRange(-8, -12),
    }

    constructor(canvasWidth: number, canvasHeight: number, buttonOffsetWidth: number, buttonOffsetHeight: number) {
        this.color = colors[Math.floor(randomRange(0, colors.length))].back
        this.radius = randomRange(1, 2)
        this.position = {
            x: randomRange(canvasWidth / 2 - buttonOffsetWidth / 3, canvasWidth / 2 + buttonOffsetWidth / 3),
            y: randomRange(
                canvasHeight / 2 + buttonOffsetHeight / 2 + 8,
                canvasHeight / 2 + 1.5 * buttonOffsetHeight - 8,
            ),
        }
    }

    public update() {
        // apply forces to velocity
        this.velocity.x -= this.velocity.x * dragSequins
        this.velocity.y = this.velocity.y + gravitySequins

        // set position
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}
