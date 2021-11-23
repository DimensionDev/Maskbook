const formatter = (address: string | undefined): string => {
    if (address) {
        return address.length > 14 ? `${address.slice(0, 6)}....${address.slice(-4)}` : address
    }
    return '...'
}

export default formatter
