import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import { loanProfileTypesMap, renewFromMap, intervalPeriodsMap, intervalIdsMap } from './constants';

export function getFixedDueDateSchedule(schedules) {
  const today = moment(new Date());
  return schedules.find(s =>
    today.isBetween(moment(s.from).startOf('day'), moment(s.to).endOf('day')));
}

export function isLoanProfileFixed(loanProfile) {
  return (loanProfile.profileId === loanProfileTypesMap.FIXED ||
    loanProfile.profileId === 'FIXED');
}

export function isLoanProfileRolling(loanProfile) {
  return (loanProfile.profileId === loanProfileTypesMap.ROLLING ||
    loanProfile.profileId === 'ROLLING');
}

export function isRenewFromSystemDate(renewalsPolicy) {
  return (renewalsPolicy.renewFromId === renewFromMap.SYSTEM_DATE);
}

export function getInterval(period) {
  return intervalPeriodsMap[period.intervalId] ||
    intervalIdsMap[period.intervalId];
}

export function getDuration(period) {
  return parseInt(period.duration, 10);
}

export function getPeriod(loanPolicy) {
  const loansPolicy = loanPolicy.loansPolicy || {};
  const renewalsPolicy = loanPolicy.renewalsPolicy || {};
  const period = (renewalsPolicy.differentPeriod) ?
    renewalsPolicy.period : loansPolicy.period;

  return period || {};
}

export function calculateRollingRenewal(loan) {
  const loanPolicy = loan.loanPolicy;
  const renewalsPolicy = loanPolicy.renewalsPolicy || {};

  const dueDate = isRenewFromSystemDate(renewalsPolicy) ? moment() : moment(loan.dueDate);

  const period = getPeriod(loanPolicy);
  const interval = getInterval(period);
  const duration = getDuration(period);

  return dueDate.add(duration, interval);
}

export function calculateFixedDueDate(loan) {
  const loanPolicy = loan.loanPolicy;
  const renewalsPolicy = loanPolicy.renewalsPolicy || {};

  if (renewalsPolicy.differentPeriod && loanPolicy.alternateFixedDueDateSchedule) {
    return moment(loanPolicy.alternateFixedDueDateSchedule.schedule.due);
  } else if (loanPolicy.fixedDueDateSchedule) { // UIU-405 get fixed renewal period from loan policy
    return moment(loanPolicy.fixedDueDateSchedule.schedule.due);
  }

  return moment(loan.dueDate);
}

export function calculateDueDate(loan) {
  const loanPolicy = loan.loanPolicy;
  const loanProfile = loanPolicy.loansPolicy || {};

  if (isLoanProfileFixed(loanProfile)) {
    return calculateFixedDueDate(loan);
  }

  if (isLoanProfileRolling(loanProfile)) {
    return calculateRollingRenewal(loan);
  }

  return moment(loan.dueDate).add(14, 'days');
}
