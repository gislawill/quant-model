import { states } from "../constants/states"
import { MitigationCosts, SuppressionCosts } from "../constants/costs"
import { CensusMeans, CensusStDevs } from "../lib/calculate-z-scores"

const key = process.env.GATSBY_CENSUS_KEY
export async function getPlaces(state) {
  const fetchUrl = `https://api.census.gov/data/2017/acs/acs5/profile?get=NAME&for=place:*&in=state:${states[state].code}&key=${key}`
  const response = await fetch(fetchUrl)
  const places = await response.json()
  return places
}

const censusVariables = [
  'DP03_0119PE', // Percent of households below poverty
  'DP05_0005PE', // Percent Below 5 years old
  'DP05_0024PE', // Percent 65 and older
  'DP03_0066PE', // Percent receiving social security
  'DP04_0058PE'  // Percent w/o cars
]

export  async function getCensusData(placeId, state) {
  censusVariables.reduce((varString, cenVar) => varString + '&' + cenVar, 'NAME')
  const fetchUrl = `https://api.census.gov/data/2017/acs/acs5/profile?get=${censusVariables}&for=place:${placeId}&in=state:${states[state].code}&key=${key}`
  const response = await fetch(fetchUrl)
  const responseJson = await response.json()
  const data = responseJson[1]
  const censusData = {}
  if (data[1] >= 0 && data[1] <= 100) censusData.percentBelowPoverty = parseFloat(data[1])
  if (data[2] >= 0 && data[2] <= 100) censusData.percentBelow5 = parseFloat(data[2])
  if (data[3] >= 0 && data[3] <= 100) censusData.percentAbove65 = parseFloat(data[3])
  if (data[4] >= 0 && data[4] <= 100) censusData.percentReceivingSS = parseFloat(data[4])
  if (data[5] >= 0 && data[5] <= 100) censusData.percentWOCars = parseFloat(data[5])
  return censusData
}

// Calculate cost to migitate risk based on landtype inputs and known costs
export function calculateMigitationCosts(formState) {
  const { acreage, percentGrass, percentForest } = formState
  const costForGrass = acreage * percentGrass * MitigationCosts.grassShrub
  const costForForest = acreage * percentForest * MitigationCosts.trees
  return costForGrass + costForForest
}

// Calculate cost to suppress fire based on landtype inputs and known costs
export function calculateSuppressionCosts(formState) {
  const { acreage, percentGrass, percentForest } = formState
  const costForGrass = acreage * percentGrass * SuppressionCosts.grassShrub
  const costForForest = acreage * percentForest * SuppressionCosts.forest
  const costForWUI = acreage * percentForest * SuppressionCosts.WUI
  return costForGrass + costForForest + costForWUI
}

// Calculate 
export function calculateSocialVulnerability(censusData) {
  const censusZValues = {
    percentAbove65: (CensusMeans.percentAbove65 - censusData.percentAbove65) / CensusStDevs.percentAbove65,
    percentBelow5: (CensusMeans.percentBelow5 - censusData.percentBelow5) / CensusStDevs.percentBelow5,
    percentBelowPoverty: (CensusMeans.percentBelowPoverty - censusData.percentBelowPoverty) / CensusStDevs.percentBelowPoverty,
    percentReceivingSS: (CensusMeans.percentReceivingSS - censusData.percentReceivingSS) / CensusStDevs.percentReceivingSS,
    percentWOCars: (CensusMeans.percentWOCars - censusData.percentWOCars) / CensusStDevs.percentWOCars,
  }
  const censusKeys = Object.keys(censusZValues)
  const averageZValue = +((censusKeys.reduce((a,b) => a + censusZValues[b], 0) / censusKeys.length).toFixed(2))
  return averageZValue
}

export async function calculateRisks (formState) {
  const places = await getPlaces(formState.state)
  const placeid = places.find(place => place[0].includes(formState.city))[2]
  const censusData = await getCensusData(placeid, formState.state)
  const socialVulnerability = calculateSocialVulnerability(censusData)
  const mitigation = calculateMigitationCosts(formState)
  const suppression = calculateSuppressionCosts(formState)
  
  return {
    socialVulnerability,
    mitigation,
    suppression
  }
}