export const isDateRangeValid = (from: string, to: string) => {
  if (!from || !to) {
    return true;
  }

  return new Date(from).getTime() <= new Date(to).getTime();
};
