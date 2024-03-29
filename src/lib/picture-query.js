import { useStaticQuery, graphql } from "gatsby"

export const usePictureQuery = () => useStaticQuery(graphql`
    query {
      fireImage1: file(relativePath: { eq: "Fire.png" }) {
        childImageSharp {
          fluid(maxWidth: 300) {
            ...GatsbyImageSharpFluid
          }
        }
      }
      fireImage2: file(relativePath: { eq: "Fire_2.png" }) {
        childImageSharp {
          fluid(maxWidth: 300) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  `)