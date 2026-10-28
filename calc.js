/* Pure calculation functions. Works in browser (window.Calc) and Node (module.exports). */
(function (root) {
  // ATO resident tax rates 2026-27 (excl. Medicare levy). Source: ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents
  var BRACKETS_2026_27 = [
    { from: 0, to: 18200, base: 0, rate: 0 },
    { from: 18200, to: 45000, base: 0, rate: 0.15 },
    { from: 45000, to: 135000, base: 4020, rate: 0.30 },
    { from: 135000, to: 190000, base: 31020, rate: 0.37 },
    { from: 190000, to: Infinity, base: 51370, rate: 0.45 }
  ];
  function incomeTax(ti) {
    ti = Math.max(0, Math.floor(ti));
    for (var i = BRACKETS_2026_27.length - 1; i >= 0; i--) {
      var b = BRACKETS_2026_27[i];
      if (ti > b.from) return b.base + (ti - b.from) * b.rate;
    }
    return 0;
  }
  // Low income tax offset: $700, less 5c/$ over 37,500 to 45,000, then 1.5c/$ over 45,000 (nil at 66,667).
  function lito(ti) {
    if (ti <= 37500) return 700;
    if (ti <= 45000) return 700 - (ti - 37500) * 0.05;
    return Math.max(0, 325 - (ti - 45000) * 0.015);
  }
  // Medicare levy 2%, single low-income reduction (latest published thresholds: $28,011 / $35,013).
  var ML_LOW = 28011, ML_HIGH = 35013;
  function medicare(ti) {
    if (ti <= ML_LOW) return 0;
    if (ti <= ML_HIGH) return Math.min((ti - ML_LOW) * 0.10, ti * 0.02);
    return ti * 0.02;
  }
  function totalTax(ti, opts) {
    opts = opts || {};
    var t = Math.max(0, incomeTax(ti) - (opts.lito === false ? 0 : lito(ti)));
    return t + (opts.medicare === false ? 0 : medicare(ti));
  }
  // Sole trader set-aside: extra tax caused by business profit on top of other income.
  // Small business income tax offset: 16% of tax attributable to net small business income, max $1,000.
  function soleTrader(p) {
    var profit = Math.max(0, +p.profit || 0), other = Math.max(0, +p.other || 0);
    var o = { lito: p.lito !== false, medicare: p.medicare !== false };
    var base = totalTax(other, o), withBiz = totalTax(other + profit, o);
    var basicTI = Math.max(0, incomeTax(other + profit) - (o.lito ? lito(other + profit) : 0));
    var share = (other + profit) > 0 ? profit / (other + profit) : 0;
    var sbo = p.sbo === false ? 0 : Math.min(1000, Math.max(0, basicTI * share * 0.16));
    var extra = Math.max(0, withBiz - base - sbo);
    return { taxOnOther: base, extraTax: extra, sbo: sbo,
      rate: profit > 0 ? extra / profit : 0, perMonth: extra / 12,
      gst: Math.max(0, +p.gstCollected || 0), totalSetAside: extra + Math.max(0, +p.gstCollected || 0) };
  }
  // Tradie charge-out rate. Margin is on sell price: rate = cost / (1 - margin).
  function chargeOut(p) {
    var wage = +p.income || 0, sup = wage * ((+p.superPct || 0) / 100);
    var cost = wage + sup + (+p.overheads || 0);
    var hours = (+p.billableHours || 0) * (+p.weeks || 0);
    var m = (+p.marginPct || 0) / 100;
    if (hours <= 0 || m >= 1) return null;
    var breakEven = cost / hours, rate = breakEven / (1 - m);
    return { superAmt: sup, annualCost: cost, hours: hours, breakEven: breakEven,
      rateExGst: rate, rateIncGst: rate * 1.1, dayRateExGst: rate * (+p.hoursPerDay || 8),
      revenueNeeded: rate * hours, markupPct: m > 0 ? (m / (1 - m)) * 100 : 0 };
  }
  // Loan repayments
  function annualRepayment(loan, ratePct, years, interestOnly) {
    if (loan <= 0) return 0;
    var r = ratePct / 100 / 12;
    if (interestOnly || r === 0) return interestOnly ? loan * ratePct / 100 : loan / (years || 30);
    var n = (years || 30) * 12;
    return loan * r / (1 - Math.pow(1 + r, -n)) * 12;
  }
  function rentalYield(p) {
    var price = +p.price || 0, wk = +p.weeklyRent || 0;
    var grossRent = wk * 52, collected = wk * (52 - (+p.vacancyWeeks || 0));
    var mgmt = collected * ((+p.mgmtPct || 0) / 100);
    var costs = mgmt + (+p.rates || 0) + (+p.insurance || 0) + (+p.strata || 0) + (+p.maintenance || 0) + (+p.other || 0);
    var loan = +p.loan || 0;
    var interest = loan * ((+p.interestPct || 0) / 100); // first-year approximation
    var repay = annualRepayment(loan, +p.interestPct || 0, +p.years || 30, !!p.interestOnly);
    if (price <= 0) return null;
    var cf = collected - costs - repay;
    return { grossRent: grossRent, collected: collected, mgmt: mgmt, costs: costs,
      grossYield: grossRent / price * 100, netYield: (collected - costs) / price * 100,
      repayment: repay, approxInterest: interest, cashFlow: cf, cashFlowWeekly: cf / 52 };
  }
  var api = { incomeTax: incomeTax, lito: lito, medicare: medicare, totalTax: totalTax,
    soleTrader: soleTrader, chargeOut: chargeOut, rentalYield: rentalYield, annualRepayment: annualRepayment };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Calc = api;
})(this);
