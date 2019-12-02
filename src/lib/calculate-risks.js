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
  'DP04_0058PE', // Percent w/o cars
  'DP05_0001E'   // population
]

export  async function getCensusData(placeId, state) {
  const censusVariablesStr = censusVariables.reduce((varString, cenVar) => varString + '&' + cenVar, 'NAME')
  const fetchUrl = `https://api.census.gov/data/2017/acs/acs5/profile?get=${censusVariablesStr}&for=place:${placeId}&in=state:${states[state].code}&key=${key}`
  const response = await fetch(fetchUrl)
  const responseJson = await response.json()
  const data = responseJson[1]
  const percentBelowPoverty = parseFloat(data[1])
  const percentBelow5 = parseFloat(data[2])
  const percentAbove65 = parseFloat(data[3])
  const percentReceivingSS = parseFloat(data[4])
  const percentWOCars = parseFloat(data[5])
  const population = parseFloat(data[6])
  const censusData = {}
  // Validate data before adding to censusData (as number, not string)
  censusData.name = data[0]
  if (percentBelowPoverty >= 0 && percentBelowPoverty <= 100) censusData.percentBelowPoverty = percentBelowPoverty
  if (percentBelow5 >= 0 && percentBelow5 <= 100) censusData.percentBelow5 = percentBelow5
  if (percentAbove65 >= 0 && percentAbove65 <= 100) censusData.percentAbove65 = percentAbove65
  if (percentReceivingSS >= 0 && percentReceivingSS <= 100) censusData.percentReceivingSS = percentReceivingSS
  if (percentWOCars >= 0 && percentWOCars <= 100) censusData.percentWOCars = percentWOCars
  if (population >= 0) censusData.population = population
  return censusData
}

// Calculate average difference from mean CA census values (z standardized)
// scores above 0 = more vulnerable than average
// scores below 0 = less vulnerable than average
export function calculateSocialVulnerability(censusData) {
  const censusZValues = {
    percentAbove65: (censusData.percentAbove65 - CensusMeans.percentAbove65) / CensusStDevs.percentAbove65,
    percentBelow5: (censusData.percentBelow5 - CensusMeans.percentBelow5) / CensusStDevs.percentBelow5,
    percentBelowPoverty: (censusData.percentBelowPoverty - CensusMeans.percentBelowPoverty) / CensusStDevs.percentBelowPoverty,
    percentReceivingSS: (censusData.percentReceivingSS - CensusMeans.percentReceivingSS) / CensusStDevs.percentReceivingSS,
    percentWOCars: (censusData.percentWOCars - CensusMeans.percentWOCars) / CensusStDevs.percentWOCars
  }
  const censusKeys = Object.keys(censusZValues)
  // calculate mean, round to 2 decimals, force back to number
  return +((censusKeys.reduce((a,b) => a + censusZValues[b], 0) / censusKeys.length).toFixed(2))
}

// Calculate cost to migitate risk based on landtype inputs and known costs
export function calculateMigitationCosts(formState) {
  const { acreage, percentGrass, percentForest } = formState
  const costForGrass = acreage * (percentGrass / 100) * MitigationCosts.grassShrub
  const costForForest = acreage * (percentForest / 100) * MitigationCosts.trees
  return costForGrass + costForForest
}

// Calculate cost to suppress fire based on landtype inputs and known costs
export function calculateSuppressionCosts(formState) {
  const { acreage, percentGrass, percentForest, percentWUI } = formState
  const costForGrass = acreage * (percentGrass / 100) * SuppressionCosts.grassShrub
  const costForForest = acreage * (percentForest / 100) * SuppressionCosts.forest
  const costForWUI = acreage * (percentWUI / 100) * SuppressionCosts.WUI
  return (costForGrass + costForForest + costForWUI) * 1.17 // account for inflation
}

function getHazardWeight(hazardLevel) {
  if (hazardLevel === 'low') return 0.1
  else if (hazardLevel === 'med') return 0.3
  else if (hazardLevel === 'hi') return 0.5 
  else if (hazardLevel === 'v-hi') return .7
  else throw new Error('Hazard level not recognized')
}

// Calculate cost to evacuate based on population, social vulnerability, and exposure to fire (WUI)
export function calculateEvacuationCosts(formState, socialVulnerability, censusData) {
  const socialVulnerabilityWeight = 1 + socialVulnerability
  const evacuatedPopulation = censusData.population * (formState.percentWUI / 100) * socialVulnerabilityWeight
  return SuppressionCosts.evacuation * evacuatedPopulation
}

// Calculate cost from damage
export function calculateDamageCosts(formState) {
  const hazardWeight = getHazardWeight(formState.hazardLevel)
  const numberOfBurnedAcres = formState.acreage * hazardWeight
  return numberOfBurnedAcres * SuppressionCosts.damagedAcre
}

// Allocation function 
export function calculateMitigationPercent(mit, sup) {
  const weightedSup = sup * 16
  const percentMit = weightedSup / (mit + weightedSup)
  return percentMit
}

export async function calculateRisks (formState) {
  const hazardWeight = getHazardWeight(formState.hazardLevel)
  const places = await getPlaces(formState.state)
  const placeid = places.find(place => place[0].includes(formState.city))[2]
  const censusData = await getCensusData(placeid, formState.state)
  const socialVulnerability = calculateSocialVulnerability(censusData)
  const mitigationCost = calculateMigitationCosts(formState)
  
  const suppressionCost = calculateSuppressionCosts(formState)
  const evacuationCost = calculateEvacuationCosts(formState, socialVulnerability, censusData)
  const damageCost = calculateDamageCosts(formState)
  const noMitigationCost = (suppressionCost + evacuationCost + damageCost) * hazardWeight
  const percentOnMitigation = calculateMitigationPercent(mitigationCost, noMitigationCost)
  const percentOnSuppression = 1 - percentOnMitigation

  const totalOnMitigation = formState.totalBudget ? formState.totalBudget * percentOnMitigation : null
  const totalOnSuppression = formState.totalBudget ? formState.totalBudget * percentOnSuppression : null

  return {
    name: censusData.name,
    mitigationCost,
    noMitigationCost,
    suppressionCost,
    evacuationCost,
    damageCost,
    percentOnMitigation,
    percentOnSuppression,
    totalOnMitigation,
    totalOnSuppression
  }
}