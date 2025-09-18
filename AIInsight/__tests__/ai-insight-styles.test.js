import React from 'react'
import { render, cleanup } from '@testing-library/react'

import {
  StyledRecommendationAccordion,
  StyledAIInsightContainer,
  shimmer,
} from '../ai-insight-styles'

afterEach(cleanup)

test('renders styled components and exports shimmer', () => {
  const { getByText, getByTestId } = render(
    <>
      <StyledRecommendationAccordion data-testid="date-test-id">
        recommendation
      </StyledRecommendationAccordion>
      <StyledAIInsightContainer data-testid="ai-insight">
        insight
      </StyledAIInsightContainer>
    </>
  )

  expect(getByText('recommendation')).toBeInTheDocument()
  expect(getByText('insight')).toBeInTheDocument()
  expect(getByTestId('date-test-id')).toBeTruthy()
  expect(shimmer).toBeDefined()
})