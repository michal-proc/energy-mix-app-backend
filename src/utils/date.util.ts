import moment from 'moment';

export const formatApiDate = (date: Date): string => moment.utc(date).format('YYYY-MM-DDTHH:mm[Z]');

export const formatDateOnly = (date: Date): string => moment.utc(date).format('YYYY-MM-DD');

export const startOfUtcDay = (date: Date): Date => moment.utc(date).startOf('day').toDate();

export const addDays = (date: Date, days: number): Date => moment.utc(date).add(days, 'days').toDate();

export const addHours = (date: Date, hours: number): Date => moment.utc(date).add(hours, 'hours').toDate();
