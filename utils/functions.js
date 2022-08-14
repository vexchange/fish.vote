import numeral from "numeral";

const formatNumber = (num, format = "0,0.00") => numeral(num).format(format);
const formatDollarAmount = (num, format = "$0,0.00") => numeral(num).format(format);

export {
  formatNumber,
  formatDollarAmount,
};
