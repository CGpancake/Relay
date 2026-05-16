export type UkBankHoliday = {
  title: string;
  date: string;
  notes: string;
};

// England and Wales division, copied from https://www.gov.uk/bank-holidays.json.
export const englandAndWalesBankHolidays: UkBankHoliday[] = [
  { title: 'New Year\'s Day', date: '2025-01-01', notes: '' },
  { title: 'Good Friday', date: '2025-04-18', notes: '' },
  { title: 'Easter Monday', date: '2025-04-21', notes: '' },
  { title: 'Early May bank holiday', date: '2025-05-05', notes: '' },
  { title: 'Spring bank holiday', date: '2025-05-26', notes: '' },
  { title: 'Summer bank holiday', date: '2025-08-25', notes: '' },
  { title: 'Christmas Day', date: '2025-12-25', notes: '' },
  { title: 'Boxing Day', date: '2025-12-26', notes: '' },
  { title: 'New Year\'s Day', date: '2026-01-01', notes: '' },
  { title: 'Good Friday', date: '2026-04-03', notes: '' },
  { title: 'Easter Monday', date: '2026-04-06', notes: '' },
  { title: 'Early May bank holiday', date: '2026-05-04', notes: '' },
  { title: 'Spring bank holiday', date: '2026-05-25', notes: '' },
  { title: 'Summer bank holiday', date: '2026-08-31', notes: '' },
  { title: 'Christmas Day', date: '2026-12-25', notes: '' },
  { title: 'Boxing Day', date: '2026-12-28', notes: 'Substitute day' },
  { title: 'New Year\'s Day', date: '2027-01-01', notes: '' },
  { title: 'Good Friday', date: '2027-03-26', notes: '' },
  { title: 'Easter Monday', date: '2027-03-29', notes: '' },
  { title: 'Early May bank holiday', date: '2027-05-03', notes: '' },
  { title: 'Spring bank holiday', date: '2027-05-31', notes: '' },
  { title: 'Summer bank holiday', date: '2027-08-30', notes: '' },
  { title: 'Christmas Day', date: '2027-12-27', notes: 'Substitute day' },
  { title: 'Boxing Day', date: '2027-12-28', notes: 'Substitute day' },
  { title: 'New Year\'s Day', date: '2028-01-03', notes: 'Substitute day' },
  { title: 'Good Friday', date: '2028-04-14', notes: '' },
  { title: 'Easter Monday', date: '2028-04-17', notes: '' },
  { title: 'Early May bank holiday', date: '2028-05-01', notes: '' },
  { title: 'Spring bank holiday', date: '2028-05-29', notes: '' },
  { title: 'Summer bank holiday', date: '2028-08-28', notes: '' },
  { title: 'Christmas Day', date: '2028-12-25', notes: '' },
  { title: 'Boxing Day', date: '2028-12-26', notes: '' },
];
