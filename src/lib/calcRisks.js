import { states } from "../constants/states"
import { MitigationCosts, SuppressionCosts } from "../constants/costs"

const key = '5c6f0430848169069032a3253ec6c3fe033c1e10'
export async function getPlaces(state) {
  const fetchUrl = `https://api.census.gov/data/2017/acs/acs5/profile?get=NAME&for=place:*&in=state:${states[state].code}&key=${key}`
  const response = await fetch(fetchUrl);
  const places = await response.json();
  return places
}

// DP03_0119PE: Percent of households below poverty
// DP05_0005PE: Percent Below 5 years old
// DP05_0024PE: Percent 65 and older
export  async function getCensusData(placeId, state) {
  const fetchUrl = `https://api.census.gov/data/2017/acs/acs5/profile?get=NAME&DP03_0119PE&DP05_0005PE&DP05_0024PE&for=place:${placeId}&in=state:${states[state].code}&key=${key}`
  const response = await fetch(fetchUrl);
  const data = await response.json();
  return data
}

// const initialFormState = {
//   city: '',
//   state: '',
//   hazard: 'low',
//   acreage: 0,
//   percentGrass: 0,
//   percentForest: 0,
//   percentWUI: 0
// }

export function calculateMigitationCosts(formState) {
  const { acreage, percentGrass, percentForest } = formState
  const costForGrass = acreage * percentGrass * MitigationCosts.grassShrub
  const costForForest = acreage * percentForest * MitigationCosts.trees
  return costForGrass + costForForest
}

export function calculateSuppressionCosts(formState) {
  const { acreage, percentGrass, percentForest } = formState
  const costForGrass = acreage * percentGrass * SuppressionCosts.grassShrub
  const costForForest = acreage * percentForest * SuppressionCosts.forest
  const costForWUI = acreage * percentForest * SuppressionCosts.WUI
  return costForGrass + costForForest + costForWUI
}

export async function calculateRisks (formState) {
  const places = await getPlaces(formState.state)
  const placeid = places.find(place => place[0].includes(formState.city))[2]
  const censusData = await getCensusData(placeid, formState.state)
  const mitigation = calculateMigitationCosts(formState)
  const suppression = calculateSuppressionCosts(formState)
  
  return {
    censusData,
    mitigation,
    suppression
  }
}