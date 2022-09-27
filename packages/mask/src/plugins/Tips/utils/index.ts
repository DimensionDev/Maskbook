import formatDateTime from 'date-fns/format'

export const getToday = () => formatDateTime(new Date(), 'yyyy-MM-dd HH:mm')
