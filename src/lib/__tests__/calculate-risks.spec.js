import { getPlaces, getCensusData, calculateMigitationCosts, calculateSuppressionCosts, calculateSocialVulnerability, calculateEvacuationCosts, calculateDamageCosts, calculateMitigationPercent, calculateAmountToMitigation } from '../calculate-risks'

describe("getPlaces", () => {
  const mockSuccessResponse = [
    ["NAME","state","place"],
    ["Calabasas city, California","06","09598"],
    ["Los Altos city, California","06","43280"]
  ]

  beforeEach(() => {
    global.fetch = jest.fn(() => new Promise(resolve => 
      resolve({ json: () => new Promise(resolve => resolve(mockSuccessResponse)) })
    ));
  })

  afterEach(() => {
    global.fetch = undefined
  })
    
  test("returns json object", async () => {
    const places = await getPlaces('ca')
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith('https://api.census.gov/data/2017/acs/acs5/profile?get=NAME&for=place:*&in=state:06&key=example-key')
    expect(places).toMatchObject(mockSuccessResponse)
  })
})

describe("getCensusData", () => {
  const mockSuccessResponse = [
    ["NAME","DP03_0119PE","DP05_0005PE","DP05_0024PE","DP03_0066PE","DP04_0058PE","DP05_0001E","state","place"],
    ["Calabasas city, California","6.1","3.4","15.9","25.3","2.2","24169","06","09598"]
  ]

  beforeEach(() => {
    global.fetch = jest.fn(() => new Promise(resolve => 
      resolve({ json: () => new Promise(resolve => resolve(mockSuccessResponse)) })
    ));
  })

  afterEach(() => {
    global.fetch = undefined
  })
    
  test("returns complete json object", async () => {
    const censusData = await getCensusData('09598', 'ca')
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith('https://api.census.gov/data/2017/acs/acs5/profile?get=NAME&DP03_0119PE&DP05_0005PE&DP05_0024PE&DP03_0066PE&DP04_0058PE&DP05_0001E&for=place:09598&in=state:06&key=example-key')
    const mockCensusData = {
      name: mockSuccessResponse[1][0],
      percentBelowPoverty: parseFloat(mockSuccessResponse[1][1]),
      percentBelow5: parseFloat(mockSuccessResponse[1][2]),
      percentAbove65: parseFloat(mockSuccessResponse[1][3]),
      percentReceivingSS: parseFloat(mockSuccessResponse[1][4]),
      percentWOCars: parseFloat(mockSuccessResponse[1][5]),
      population: parseFloat(mockSuccessResponse[1][6])
    }
    expect(censusData).toMatchObject(mockCensusData)
  })
})

describe("calculateSocialVulnerability", () => {
  test("returns proper positive calculation", () => {
    // all values one st dev above mean
    const censusData = {
      percentAbove65: 32.62,
      percentBelow5: 9.55,
      percentBelowPoverty: 23.98,
      percentReceivingSS: 51.25,
      percentWOCars: 10.41
    }
    const socialVulnerability = calculateSocialVulnerability(censusData)
    expect(socialVulnerability).toBe(1)
  })

  test("returns proper negative calculation", () => {
    // all values one half st dev below mean
    const censusData = {
      percentAbove65: 11.725,
      percentBelow5: 3.58,
      percentBelowPoverty: 5.41,
      percentReceivingSS: 26.515,
      percentWOCars: 2.28
    }
    const socialVulnerability = calculateSocialVulnerability(censusData)
    expect(socialVulnerability).toBe(-0.5)
  })
})

describe("calculateMigitationCosts", () => {
  test("returns proper calculation", () => {
    const formState = {
      acreage: 100, 
      percentGrass: 20, 
      percentForest: 10
    }
    const migitationCosts = calculateMigitationCosts(formState)
    expect(migitationCosts).toBe(514552.5)
  })
})

describe("calculateMigitationCosts", () => {
  test("returns proper calculation", () => {
    const formState = {
      acreage: 100, 
      percentGrass: 20, 
      percentForest: 10,
      percentWUI: 5
    }
    const suppressionCosts = calculateSuppressionCosts(formState)
    expect(+(suppressionCosts.toFixed(2))).toBe(20457.45)
  })
})

describe("calculateEvacuationCosts", () => {
  test("returns proper calculation for below average social vulnerability", () => {
    const formState = { percentWUI: 10 }
    const socialVulnerability = -0.5
    const censusData = { population: 100 }
    const evacuationCosts = calculateEvacuationCosts(formState, socialVulnerability, censusData)
    expect(evacuationCosts).toBe(1050)
  })

  test("returns proper calculation for above average social vulnerability", () => {
    const formState = { percentWUI: 10 }
    const socialVulnerability = 0.5
    const censusData = { population: 100 }
    const evacuationCosts = calculateEvacuationCosts(formState, socialVulnerability, censusData)
    expect(evacuationCosts).toBe(3150)
  })
})

describe("calculateDamageCosts", () => {
  test("returns proper calculation", () => {
    const formState = { acreage: 100, hazardLevel: 'med' }
    const damageCosts = calculateDamageCosts(formState)
    expect(damageCosts).toBe(98400)
  })
})

describe("calculateMitigationPercent", () => {
  test("returns proper calculation: 32:1", () => {
    const mitigationCost = 3200
    const noMitigationCost = 100 // 1600
    const mitigationPercent = calculateMitigationPercent(mitigationCost, noMitigationCost)
    expect(mitigationPercent).toBe(1/3)
  })
  
  test("returns proper calculation: 16:1", () => {
    const mitigationCost = 1600
    const noMitigationCost = 100
    const mitigationPercent = calculateMitigationPercent(mitigationCost, noMitigationCost)
    expect(mitigationPercent).toBe(0.50)
  })

  test("returns proper calculation: 4:1", () => {
    const mitigationCost = 400
    const noMitigationCost = 100
    const mitigationPercent = calculateMitigationPercent(mitigationCost, noMitigationCost)
    expect(mitigationPercent).toBe(0.80)
  })
})
  