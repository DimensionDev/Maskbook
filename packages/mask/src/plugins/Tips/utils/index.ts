import formatDateTime from 'date-fns/format'

export const getNowTime = () => formatDateTime(new Date(), 'yyyy-MM-dd HH:mm')
