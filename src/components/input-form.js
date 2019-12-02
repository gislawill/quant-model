import React from "react"
import { states } from "../constants/states"
import { calculateRisks } from "../lib/calculate-risks"

const initialFormState = {
  city: '',
  state: 'ca',
  hazardLevel: 'low',
  acreage: 0,
  percentGrass: 0,
  percentForest: 0,
  percentWUI: 0,
  totalBudget: 0
}

function formReducer(state, action) {
  switch (action.type) {
    case 'input': return { ...state, [action.field]: action.value }
    default: throw new Error()
  }
}

const InputForm = props => {
  const { setDecision } = props
  const [formState, dispatch] = React.useReducer(formReducer, initialFormState)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleInputChange = event => { 
    dispatch({
      type: 'input',
      field: event.target.id,
      value: event.target.value
    })
  }
  
  async function handleSubmit (event)  { 
    event.preventDefault()
    setIsSubmitting(true)
    const data = await calculateRisks(formState)
    setIsSubmitting(false)
    if (data) {
      setDecision(data)
    } else {
      alert('We couldn\'t find your city. Please check your spelling and capitalization and try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Your City Name:
        <input type="text" id="city" value={formState.city} onChange={handleInputChange} />
      </label><br />
      <label>
        Your State:
        <select id="state" value={formState.state} onChange={handleInputChange}>
          {Object.keys(states).map(stateCode => (
            <option value={stateCode} key={stateCode}>{states[stateCode].name}</option>
          ))}
        </select>
      </label><br />
      <label>
        Current Fire Hazard Severity:
        <select id="hazardLevel" value={formState.hazardLevel} onChange={handleInputChange}>
          <option value={'low'}>Low</option>
          <option value={'med'}>Medium</option>
          <option value={'hi'}>High</option>
          <option value={'v-hi'}>Very High</option>
        </select>
      </label><br />
      <label>
        The Total Acreage:
        <input type="number" id="acreage" value={formState.acreage} onChange={handleInputChange} />
      </label><br />
      <label>
        The Percent Grass:
        <input type="number" id="percentGrass" value={formState.percentGrass} onChange={handleInputChange} />
      </label><br />
      <label>
        The Percent Forest:
        <input type="number" id="percentForest" value={formState.percentForest} onChange={handleInputChange} />
      </label><br />
      <label>
        The Percent WUI:
        <input type="number" id="percentWUI" value={formState.percentWUI} onChange={handleInputChange} />
      </label><br />
      <label>
        Fire Budget (optional):
        <input type="number" id="totalBudget" value={formState.totalBudget} onChange={handleInputChange} />
      </label><br />
      <input type="submit" value={isSubmitting ? "Submitting..." : "Submit"} />
      <br />
    </form>
  )
}

export default InputForm