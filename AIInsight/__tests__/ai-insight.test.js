import { render } from '@testing-library/react'
import AIInsight, { Summary, ItemList, LinkToArticle, ContinueTroubleshooting, ErrorMessage, FeedbackContainer, IconContainer, Recommendations, RecommendationItem} from '../ai-insight'

// Mock timers for testing useEffect with setTimeout
jest.useFakeTimers()

describe('<AIInsight />', () => {
  test('should render AIInsight component', () => {
    const { container } = render(
      <AIInsight id='IN123' handleSubSymptoms={() => {}} />
    )
    const elByContainer = container.querySelector('#ai-insight')
    expect(elByContainer).toBeInTheDocument()
  })

  test('should render Summary component', () => {
    const { getByText } = render(<Summary list={[]} />)
    expect(getByText('Customer experience')).toBeInTheDocument()
  })

  test('should render Summary component with list items', () => {
    const list = ['Item 1', 'Item 2']
    const { getByText } = render(<Summary list={list} />)
    expect(getByText('Item 1')).toBeInTheDocument()
  })

  test('should render ItemList component', () => {
    const item = { steps: ['Step 1', 'Step 2'] }
    const { getByText } = render(<ItemList item={item} isDark={false} />)
    expect(getByText('Step 1')).toBeInTheDocument()
  })

  test('should render LinkToArticle component', () => {
    const { getByText } = render(<LinkToArticle label="Learn more" url="https://example.com" />)
    expect(getByText('Learn more')).toBeInTheDocument()
  })

  test('should render ContinueTroubleshooting component', () => {
    const { getByText } = render(<ContinueTroubleshooting handleSubSymptoms={() => {}} isDark={false} isLoading={false} />)
    expect(getByText('Continue Troubleshooting')).toBeInTheDocument()
  })

  test('should render ContinueTroubleshooting component when loading', () => {
    const { getByText } = render(<ContinueTroubleshooting handleSubSymptoms={() => {}} isDark={false} isLoading={true} />)
    expect(getByText('Continue Troubleshooting')).toBeInTheDocument()
  })

  test('should call handleSubSymptoms after 1 minute when loading', () => {
    const mockHandleSubSymptoms = jest.fn()
    render(<ContinueTroubleshooting handleSubSymptoms={mockHandleSubSymptoms} isDark={false} isLoading={true} />)
    
    jest.advanceTimersByTime(60000)
    expect(mockHandleSubSymptoms).toHaveBeenCalled()
  })

  test('should render ErrorMessage component', () => {
    const { getByText } = render(<ErrorMessage />)
    expect(getByText('Unable to get insights at the moment.')).toBeInTheDocument()
  })

  test('should render FeedbackContainer component', () => {
    const { container } = render(<FeedbackContainer isDisabled={false} id="test-id" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  test('should render IconContainer component', () => {
    const { container } = render(<IconContainer />)
    expect(container.firstChild).toBeInTheDocument()
  })

  test('should render Recommendations component', () => {
    const recommendations = [{ title: 'Test Recommendation' }]
    const { getByText } = render(<Recommendations recommendations={recommendations} id="test-id" />)
    expect(getByText('Recommendations')).toBeInTheDocument()
  })

  test('should render RecommendationItem component', () => {
    const item = { title: 'Test Item', steps: ['Step 1'] }
    const { getByText } = render(<RecommendationItem id="test-id" item={item} />)
    expect(getByText('Step 1')).toBeInTheDocument()
  })
})
