const DEFAULT_IMAGES = [
    new URL('./Aura1.svg', import.meta.url).toString(),
    new URL('./Aura2.svg', import.meta.url).toString(),
    new URL('./Aura3.svg', import.meta.url).toString(),
    new URL('./Aura4.svg', import.meta.url).toString(),
    new URL('./Aura5.svg', import.meta.url).toString(),
    new URL('./Aura6.svg', import.meta.url).toString(),
    new URL('./Aura7.svg', import.meta.url).toString(),
    new URL('./Aura8.svg', import.meta.url).toString(),
    new URL('./Aura9.svg', import.meta.url).toString(),
    new URL('./Aura10.svg', import.meta.url).toString(),
    new URL('./Aura11.svg', import.meta.url).toString(),
    new URL('./Aura12.svg', import.meta.url).toString(),
]

export const name2Image = (name?: string): string => {
    if (!name) return DEFAULT_IMAGES[0]
    let sum = 0
    for (let i = 0; i < name.length; i += 1) {
        sum += name.charCodeAt(i)
    }

    return DEFAULT_IMAGES[sum % DEFAULT_IMAGES.length]
}
