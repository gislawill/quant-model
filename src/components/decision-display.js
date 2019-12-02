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
  const mitigationReccomendation = hasTotals 
    ? `$${totalOnMitigation}` 
    : `${(percentOnMitigation * 100).toFixed(2)}% of your fire budget`
  const suppressionReccomendation = hasTotals 
    ? `$${totalOnSuppression}` 
    : `${(percentOnSuppression * 100).toFixed(2)}% of your fire budget`
  return (
    <>
      <h3>We reccomend spending {mitigationReccomendation} on mitigation and {suppressionReccomendation} on suppression this year.</h3>
      <p>Why?</p>
      <p>We estimate your annual cost to mitigate will come to a total of ${mitigationCosts}.</p>
      <p>If you don't mitigate, we estimate your annual expenses responding to fires will come to a total of ${fireCosts}.</p>
    </>
  )
}

export default DecisionDisplay