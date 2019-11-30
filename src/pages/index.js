import React from "react"
import { states } from "../constants/states"
import { calculateRisks } from "../lib/calculate-risks"

const initialFormState = {
  city: '',
  state: 'ca',
  hazard: 'low',
  acreage: 0,
  percentGrass: 0,
  percentForest: 0,
  percentWUI: 0
}

function formReducer(state, action) {
  switch (action.type) {
    case 'input': return { ...state, [action.field]: action.value }
    default: throw new Error()
  }
}

const IndexPage = () => {
  const [formState, dispatch] = React.useReducer(formReducer, initialFormState)
  const [response, setResponse] = React.useState('')

  const handleInputChange = event => { 
    dispatch({
      type: 'input',
      field: event.target.id,
      value: event.target.value
    })
  }
  
  async function handleSubmit (event)  { 
    event.preventDefault()
    const data = await calculateRisks(formState)
    setResponse(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        City Name:
        <input type="text" id="city" value={formState.city} onChange={handleInputChange} />
      </label><br />
      <label>
        State:
        <select id="state" value={formState.state} onChange={handleInputChange}>
          {Object.keys(states).map(stateCode => (
            <option value={stateCode} key={stateCode}>{states[stateCode].name}</option>
          ))}
        </select>
      </label><br />
      <label>
        Fire Hazard Severity:
        <select id="hazard" value={formState.hazard} onChange={handleInputChange}>
          <option value={'low'}>Low</option>
          <option value={'med'}>Medium</option>
          <option value={'hi'}>High</option>
          <option value={'v-hi'}>Very High</option>
        </select>
      </label><br />
      <label>
        Total Acreage:
        <input type="number" id="acreage" value={formState.acreage} onChange={handleInputChange} />
      </label><br />
      <label>
        Percent Grass:
        <input type="number" id="percentGrass" value={formState.percentGrass} onChange={handleInputChange} />
      </label><br />
      <label>
        Percent Forest:
        <input type="number" id="percentForest" value={formState.percentForest} onChange={handleInputChange} />
      </label><br />
      <label>
        Percent WUI:
        <input type="number" id="percentWUI" value={formState.percentWUI} onChange={handleInputChange} />
      </label><br />
      <input type="submit" value="Submit" />
      <br />
      <pre>
        {response && JSON.stringify(response, null, 2)}
      </pre>
    </form>
  )
}

export default IndexPage
