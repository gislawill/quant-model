import React from "react"

const localeStringOpts = {
  minimumFractionDigits: 0, 
  maximumFractionDigits: 0
}

const DecisionDisplay = props => {
  const { decision: { mitigationCost, noMitigationCost, totalOnMitigation, totalOnSuppression, percentOnMitigation, percentOnSuppression } } = props
  const mitigationCosts = mitigationCost.toLocaleString(undefined, localeStringOpts);
  const fireCosts = noMitigationCost.toLocaleString(undefined, localeStringOpts);
  const hasTotals = totalOnMitigation && totalOnSuppression
  const mitigationPercent = (percentOnMitigation * 100).toFixed(1) + '% of your fire budget'
  const suppressionPercent = (percentOnSuppression * 100).toFixed(1) + '% of your fire budget'
  const mitigationReccomendation = hasTotals 
    ? `$${totalOnMitigation.toLocaleString(undefined, localeStringOpts)}` 
    : mitigationPercent
  const suppressionReccomendation = hasTotals 
    ? `$${totalOnSuppression.toLocaleString(undefined, localeStringOpts)}` 
    : suppressionPercent
  return (
    <>
      <h3 className="reccomendation">We recommend spending {mitigationReccomendation} on mitigation and {suppressionReccomendation} on suppression this year.</h3>
      <p><strong>Why, you ask?</strong></p>
      <p>
        We estimate your annual cost to mitigate will come to a total of <strong>${mitigationCosts}</strong>. 
        If you don't mitigate, we estimate your annual expenses responding to fires will come to a total of&nbsp;
        <strong>${fireCosts}</strong>.
      </p>
      <p>
        Now remember, <i>&ldquo;an ounce of prevention is worth a pound of cure&rdquo;</i> (Franklin et. al, 1736). 
        Following ol&rsquo; Ben&rsquo;s advice, we reccomend spending on mitigation at a rate of 16:1 meaning 
        for every dollar spent on mitigation, you'll save $16 in suppression costs.
      </p>
      <p>
        Based on our estimated mitigation and suppression costs for your city, spending {mitigationPercent} 
        on mitigation efforts and {suppressionPercent} on suppression efforts should yield the best return 
        on your investment.
      </p>
    </>
  )
}

export default DecisionDisplay