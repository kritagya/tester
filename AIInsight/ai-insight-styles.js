import styled, { keyframes } from 'styled-components'

// Keyframe animation for shimmer effect
const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`

// Styled component for the recommendation accordion
export const StyledRecommendationAccordion = styled.div`
  [data-testid='date-test-id'] {
    padding-block: 0.5rem !important;
  }

  .toggleIconWrapper {
    margin-top: 0.5rem !important;
  }

  [role='region'] {
    padding-bottom: unset !important;
  }

  .accordionButton .childrenWrapper {
    padding-bottom: unset !important;
  }
`

// Styled component for the network insight container
export const StyledNetworkInsightContainer = styled.div`
  * {
    background-color: transparent !important;
  }
  [id^='accordionHeader'],
  [class^='StyledAccordionItem'] {
    border-top: unset !important;
    border-bottom: unset !important;
  }
     [class^="StyledAccordionDetail-VDS"]{
    padding-bottom:5px !important;
  }
`

// Export the shimmer animation for potential use elsewhere
export { shimmer }
