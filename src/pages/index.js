import React from "react"
import { useStaticQuery } from "gatsby"
import Img from "gatsby-image"
import InputForm from '../components/form'
import { PictureQuery } from '../lib/picture-query'
import './layout.css'

const IndexPage = () => {
  const data = useStaticQuery(PictureQuery)
  const [documentHeight, setDocumentHeight] = React.useState(0)
  const [imageOpacity, setImageOpacity] = React.useState(.65)
  const [imageTransform, setImageTransform] = React.useState(.85)
  const windowHeight = window.innerHeight


  React.useEffect(() => {
    setDocumentHeight(document.body.clientHeight)
    function handleScroll() {
      const scrollPosition = window.scrollY + windowHeight
      const scrollState = scrollPosition / documentHeight
      setImageOpacity(scrollState)
      setImageTransform(scrollState + .20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => { window.removeEventListener('scroll', handleScroll) }
  }, [setDocumentHeight, setImageOpacity, setImageTransform, documentHeight, windowHeight])
  
  const imageStyle = {
    opacity: imageOpacity,
    transform: `scale(${imageTransform}) translateY(${(imageTransform * -70) + 70}%)`,
    transition: 'opacity .2s ease'
  }

  return (
    <>
      <div className="container">
        <h1>Should you invest in wildfire mitigation?</h1>
        <h3>It's not an easy question. Use our simple tool to help you decide.</h3>
        <InputForm />
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
