import { data } from './shared.js'
export async function echo(...args) {
    console.log(data)
    return args
}
