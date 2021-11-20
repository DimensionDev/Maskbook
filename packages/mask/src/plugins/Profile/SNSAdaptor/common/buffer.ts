interface requestParams {
    address: string
    platform: string
    identity: string
    id: string
    type: string
}

const requestBuffer: requestParams = {
    address: '',
    platform: '',
    identity: '',
    id: '',
    type: '',
}

const updateBuffer = (address: string, platform: string, identity: string, id: string, type: string) => {
    requestBuffer.address = address
    requestBuffer.platform = platform
    requestBuffer.identity = identity
    requestBuffer.id = id
    requestBuffer.type = type
}

const checkBuffer = (address: string, platform: string, identity: string, id: string, type: string) => {
    return (
        requestBuffer.address === address &&
        requestBuffer.platform === platform &&
        requestBuffer.identity === identity &&
        requestBuffer.id === id &&
        requestBuffer.type === type
    )
}

const buffer = {
    updateBuffer,
    checkBuffer,
}

export default buffer
