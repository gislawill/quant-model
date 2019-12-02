import React from "react"
import Img from "gatsby-image"
import InputForm from '../components/input-form'
import DecisionDisplay from '..//components/decision-display'
import { usePictureQuery } from '../lib/picture-query'
import './layout.css'

const IndexPage = () => {
  const data = usePictureQuery()
  const [result, setResult] = React.useState(null)
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
            <DecisionDisplay decision={result} />
            <button onClick={() => setResult(null)}>Try another city</button>
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
