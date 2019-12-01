import React from "react"

const localeStringOpts = {
  minimumFractionDigits: 0, 
  maximumFractionDigits: 0
}

const DecisionDisplay = props => {
  const { decision } = props
  const mitigationCosts = decision.mitigationCost.toLocaleString(undefined, localeStringOpts);
  const fireCosts = decision.noMitigationCost.toLocaleString(undefined, localeStringOpts);
  const reccomendation = decision.decision === 'mitigate' ? 'Invest in mitigation.' : 'Do not invest in mitigation.'
  return (
    <>
      <p>Our Reccomendation:</p>
      <h3>{reccomendation}</h3>
      <p>Why?</p>
      <p>We estimate your annual cost to mitigate will come to a total of ${mitigationCosts}.</p>
      <p>If you don't mitigate, we estimate your annual expenses responding to fires will come to a total of ${fireCosts}.</p>
    </>
  )
}

export default DecisionDisplay