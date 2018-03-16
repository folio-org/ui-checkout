import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies
import { loanProfileTypesMap } from './constants';

export function getFixedDueDateSchedule(schedules) {
  const today = moment(new Date());
  return schedules.find(s =>
    today.isBetween(moment(s.from).startOf('day'), moment(s.to).endOf('day')));
}

export function isLoanProfileFixed(loanProfile) {
  return (loanProfile.profileId === loanProfileTypesMap.FIXED ||
    loanProfile.profileId === 'FIXED');
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

  return moment(loan.dueDate).add(14, 'days');
}
