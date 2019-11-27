const censusVariables = [
  'DP03_0119PE', // Percent of households below poverty
  'DP05_0005PE', // Percent Below 5 years old
  'DP05_0024PE', // Percent 65 and older
  'DP03_0066PE', // Percent receiving social security
  'DP04_0058PE' // Percent w/o cars
]

const key = process.env.GATSBY_CENSUS_KEY
export async function getCensusData() {
  const censusVarString = censusVariables.reduce((varString, cenVar) => varString + '&' + cenVar, 'NAME')
  const fetchUrl = `https://api.census.gov/data/2017/acs/acs5/profile?get=${censusVarString}&for=place:*&in=state:06&key=${key}`
  const response = await fetch(fetchUrl);
  const data = await response.json();
  return data
}

function parseCensusData (censusData) {
  const accumulatedData = {
    percentBelowPoverty: [],
    percentBelow5: [],
    percentAbove65: [],
    percentReceivingSS: [],
    percentWOCars: []
  }
  censusData.forEach((place, i) => {
    if (i === 0) return
    if (place[1] >= 0 && place[1] <= 100) accumulatedData.percentBelowPoverty.push(parseFloat(place[1]))
    if (place[2] >= 0 && place[2] <= 100) accumulatedData.percentBelow5.push(parseFloat(place[2]))
    if (place[3] >= 0 && place[3] <= 100) accumulatedData.percentAbove65.push(parseFloat(place[3]))
    if (place[4] >= 0 && place[4] <= 100) accumulatedData.percentReceivingSS.push(parseFloat(place[4]))
    if (place[5] >= 0 && place[5] <= 100) accumulatedData.percentWOCars.push(parseFloat(place[5]))
  });
  return accumulatedData
}

// Mean and St. Dev. functions more-or-less pulled from: 
// https://derickbailey.com/2014/09/21/calculating-standard-deviation-with-array-map-and-array-reduce-in-javascript/
function getMean(arr) {
  return +((arr.reduce((a,b) => a + b, 0) / arr.length).toFixed(2))
}

function getStDev(arr){
  const mean = getMean(arr);
  
  const squareDiffs = arr.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  
  const avgSquareDiff = getMean(squareDiffs);
  return +(Math.sqrt(avgSquareDiff).toFixed(2));
}

export async function calcZ () {
  const censusData = await getCensusData()
  const accumulatedData = parseCensusData(censusData)
  const accumulatedDataMean = { // eslint-disable-line no-unused-vars
    percentBelowPoverty: getMean(accumulatedData.percentBelowPoverty),
    percentBelow5: getMean(accumulatedData.percentBelow5),
    percentAbove65: getMean(accumulatedData.percentAbove65),
    percentReceivingSS: getMean(accumulatedData.percentReceivingSS),
    percentWOCars: getMean(accumulatedData.percentWOCars)
  }
  const accumulatedDataStDev = { // eslint-disable-line no-unused-vars
    percentBelowPoverty: getStDev(accumulatedData.percentBelowPoverty),
    percentBelow5: getStDev(accumulatedData.percentBelow5),
    percentAbove65: getStDev(accumulatedData.percentAbove65),
    percentReceivingSS: getStDev(accumulatedData.percentReceivingSS),
    percentWOCars: getStDev(accumulatedData.percentWOCars)
  }
}

// Calculated Means:
export const CensusMeans = {
  percentAbove65: 18.69,
  percentBelow5: 5.57,
  percentBelowPoverty: 11.6,
  percentReceivingSS: 34.76,
  percentWOCars: 4.99
}

// Calculated St. Devs:
export const CensusStDevs = {
  percentAbove65: 13.93,
  percentBelow5: 3.98,
  percentBelowPoverty: 12.38,
  percentReceivingSS: 16.49,
  percentWOCars: 5.42
}