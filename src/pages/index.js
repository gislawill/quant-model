import React from "react"
import Img from "gatsby-image"
import InputForm from '../components/input-form'
import DecisionDisplay from '..//components/decision-display'
import { usePictureQuery } from '../lib/picture-query'
import './layout.css'

const mockResult = {
  damageCost: 32800,
  evacuationCost: 548152.92,
  mitigationCost: 811305,
  name: "Calabasas city, California",
  noMitigationCost: 64027.19200000001,
  percentOnMitigation: 0.5580501769424795,
  percentOnSuppression: 0.4419498230575205,
  suppressionCost: 59319,
  totalOnMitigation: null,
  totalOnSuppression: null
}

const IndexPage = () => {
  const data = usePictureQuery()
  const [result, setResult] = React.useState(mockResult)
  const [documentHeight, setDocumentHeight] = React.useState(0)
  const [imageOpacity, setImageOpacity] = React.useState(.65)
  const [imageTransform, setImageTransform] = React.useState(.85)
  
  React.useEffect(() => {
    const windowHeight = window.innerHeight
    setDocumentHeight(document.body.clientHeight)
    function handleScroll() {
      const scrollState = (window.scrollY + windowHeight) / documentHeight
      setImageOpacity(scrollState)
      setImageTransform(scrollState)
    }
    window.addEventListener('scroll', handleScroll)
    return () => { window.removeEventListener('scroll', handleScroll) }
  }, [setDocumentHeight, setImageOpacity, setImageTransform, documentHeight])
  
  const opacity = result ? 1 : imageOpacity
  const transform = result ? '' : `scale(${imageTransform}) translateY(${(imageTransform * -70) + 70}%)`
  const imageStyle = { opacity, transform }
  console.log('result', result)
  return (
    <>
      <div className="container">
        <h1>Should you invest in wildfire mitigation?</h1>
        <h3>It's not an easy question. Use our simple tool to help you decide.</h3>
        {!result && <InputForm setDecision={setResult} />}
        {result && (
          <>
            <button onClick={() => setResult(null)}>Update Inputs</button>
            <DecisionDisplay decision={result} />
          </>
        )}
      </div>
      <div className="fire-container fire-container__1" style={imageStyle}>
        <Img fluid={data.fireImage2.childImageSharp.fluid} />
      </div>
      <div className="fire-container fire-container__2" style={imageStyle}>
        <Img fluid={data.fireImage1.childImageSharp.fluid} />
      </div>
    </>
  )
}

export default IndexPage
