var aud=function(n,d){return n==null||!isFinite(n)?'–':n.toLocaleString('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:d==null?0:d})};
var pct=function(n){return isFinite(n)?n.toFixed(2)+'%':'–'};
function vals(){var o={};document.querySelectorAll('#f input').forEach(function(i){o[i.id]=i.type==='checkbox'?i.checked:parseFloat(i.value)||0});return o}
function set(id,t){document.getElementById(id).textContent=t}
function bind(kind){var run=function(){var v=vals(),r;
 if(kind==='rental'){r=Calc.rentalYield(v);if(!r)return;set('o_gy',pct(r.grossYield));set('o_ny',pct(r.netYield));set('o_col',aud(r.collected));set('o_cost',aud(r.costs));set('o_rep',aud(r.repayment));set('o_cf',aud(r.cashFlow));set('o_cfw',aud(r.cashFlowWeekly))}
 if(kind==='chargeout'){r=Calc.chargeOut(v);if(!r){set('o_rate','Check inputs');return}set('o_rate',aud(r.rateExGst,2)+'/hr');set('o_inc',aud(r.rateIncGst,2)+'/hr');set('o_day',aud(r.dayRateExGst));set('o_be',aud(r.breakEven,2)+'/hr');set('o_cost',aud(r.annualCost));set('o_hrs',r.hours.toLocaleString('en-AU'));set('o_mu',pct(r.markupPct))}
 if(kind==='sole'){r=Calc.soleTrader(v);set('o_rate',pct(r.rate*100));set('o_extra',aud(r.extraTax));set('o_mo',aud(r.perMonth));set('o_sbo',aud(r.sbo));set('o_gst',aud(r.gst));set('o_total',aud(r.totalSetAside))}
 if(kind==='vicduty'){r=Calc.vicDuty({value:v.value,ppr:v.ppr,fhb:v.fhb});set('o_pay',aud(r.payable));set('o_gen',aud(r.general));set('o_save',aud(r.saving));set('o_eff',pct(r.effectiveRate))}
 if(kind==='takehome'){r=Calc.takeHome(v);set('o_net',aud(r.net));set('o_fn',aud(r.fortnightly));set('o_wk',aud(r.weekly));set('o_mo',aud(r.monthly));set('o_tax',aud(r.incomeTax));set('o_ml',aud(r.medicare));set('o_help',aud(r.help));set('o_sup',aud(r.employerSuper));set('o_eff',pct(r.effectiveRate))}
 if(kind==='contractor'){r=Calc.contractorRate(v);if(!r){set('o_rate','Check inputs');return}set('o_rate',aud(r.rateExGst,2)+'/hr');set('o_inc',aud(r.rateIncGst,2)+'/hr');set('o_day',aud(r.dayRate));set('o_pkg',aud(r.package));set('o_hrs',Math.round(r.hours).toLocaleString('en-AU'));set('o_rev',r.offeredAsSalary?aud(r.offeredAsSalary):'–')}
 if(kind==='mortgage'){r=Calc.mortgageExtra(v);var ym=function(m){return Math.floor(m/12)+' yrs '+(m%12)+' mths'};set('o_rep',aud(r.repayment,2));set('o_save',aud(r.interestSaved));set('o_time',ym(r.monthsSaved));set('o_new',ym(r.newMonths));set('o_bi',aud(r.baseInterest));set('o_ni',aud(r.newInterest))}};
 document.getElementById('f').addEventListener('input',run);run()}
