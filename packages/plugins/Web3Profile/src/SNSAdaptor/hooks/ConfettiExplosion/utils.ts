// colors, back side is darker for confetti flipping
export const colors = [
    { front: '#abfe2c', back: '#5CC91A' }, // Purple
    { front: '#00C21F', back: '#21C93C' }, // Light Blue
    { front: '#C3FF9E', back: '#9FEA71' }, // Darker Blue
]

// amount to add on each button press
export const confettiCount = 20
export const sequinCount = 10

// "physics" variables
export const gravityConfetti = 0.3
export const gravitySequins = 0.55
export const dragConfetti = 0.075
export const dragSequins = 0.02
export const terminalVelocity = 3

// helper function to pick a random number within a range
export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min

// helper function to get initial velocities for confetti
// this weighted spread helps the confetti look more realistic
export const initConfettoVelocity = (xRange: number[], yRange: number[]) => {
    const x = randomRange(xRange[0], xRange[1])
    const range = yRange[1] - yRange[0] + 1
    let y = yRange[1] - Math.abs(randomRange(0, range) + randomRange(0, range) - range)
    if (y >= yRange[1] - 1) {
        // Occasional confetto goes higher than the max
        y += Math.random() < 0.25 ? randomRange(1, 3) : 0
    }
    return { x, y: -y }
}
