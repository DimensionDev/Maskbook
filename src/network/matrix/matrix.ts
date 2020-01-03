/// <reference path="./matrix.type.d.ts" />
import sdk from 'matrix-js-sdk'
const client = sdk.createClient('http://matrix.vampire.rip')

// Listen for low-level MatrixEvents
client.on('event', function(event) {
    console.log(event.getType())
})

// Listen for typing changes
client.on('RoomMember.typing', function(event, member) {
    if (member.typing) {
        console.log(member.name + ' is typing...')
    } else {
        console.log(member.name + ' stopped typing.')
    }
})

const matrixClientStatus = client.startClient({ initialSyncLimit: 10 })

// @ts-ignore
client.publicRooms(function(err, data) {
    console.log('Public Rooms: %s', JSON.stringify(data))
})
