import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import AIInsight, { 
  Summary, 
  ItemList, 
  LinkToArticle, 
  ContinueTroubleshooting, 
  ErrorMessage, 
  FeedbackContainer, 
  IconContainer, 
  Recommendations, 
  RecommendationItem,
  LoadingSkeleton,
  Header,
  AIInsightFeedback
} from '../ai-insight'

// Mock all the dependencies
jest.mock('../ai-insight-hooks', () => ({
  useAIInsight: jest.fn()
}))

jest.mock('../helpers/useParamDetails', () => ({
  useParamsDetails: jest.fn()
}))

jest.mock('./ai-insight-store', () => ({
  useAIInsightStore: jest.fn()
}))

jest.mock('../Feedback', () => {
  return function MockFeedback(props) {
    return <div data-testid="feedback" {...props}>Mock Feedback</div>
  }
})

jest.mock('@vds/icons/ideas-solutions', () => {
  return function MockIdeasSolutions(props) {
    return <div data-testid="ideas-solutions" {...props}>Ideas Solutions Icon</div>
  }
})

jest.mock('@vds/loaders', () => ({
  Loader: function MockLoader(props) {
    return <div data-testid="loader" {...props}>Loading...</div>
  }
}))

// Mock timers for testing useEffect with setTimeout
jest.useFakeTimers()

// Import the mocked hooks
import { useAIInsight } from '../ai-insight-hooks'
import { useParamsDetails } from '../helpers/useParamDetails'
import { useAIInsightStore } from './ai-insight-store'

describe('<AIInsight />', () => {
  beforeEach(() => {
    // Setup default mocks
    useParamsDetails.mockReturnValue({
      theme: { isDark: false, surface: 'light' },
      acssCallId: 'call123'
    })
    useAIInsightStore.mockReturnValue({
      currentIntent: {},
      intentId: 'IN123',
      isNetworkInsight: false
    })
    useAIInsight.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render AIInsight component', () => {
    const { container } = render(
      <AIInsight id='IN123' handleSubSymptoms={() => {}} />
    )
    const elByContainer = container.querySelector('#ai-insight')
    expect(elByContainer).toBeInTheDocument()
  })

  test('should render AIInsight with loading state', () => {
    useAIInsight.mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    })

    const { getByText, getByTestId } = render(
      <AIInsight id='IN123' handleSubSymptoms={() => {}} />
    )
    
    expect(getByText('Summarizing the findings...')).toBeInTheDocument()
    expect(getByTestId('loader')).toBeInTheDocument()
  })

  test('should render AIInsight with error state', () => {
    useAIInsight.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('API Error')
    })

    const { getByText } = render(
      <AIInsight id='IN123' handleSubSymptoms={() => {}} />
    )
    
    expect(getByText('Unable to get insights at the moment.')).toBeInTheDocument()
  })

  test('should render AIInsight with data', () => {
    const mockData = {
      summary: { data: ['Summary item 1', 'Summary item 2'] },
      recommendations: [
        { title: 'Recommendation 1', steps: ['Step 1', 'Step 2'], link: 'https://example.com' }
      ],
      transactionId: 'tx123'
    }

    useAIInsight.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null
    })

    const { getByText } = render(
      <AIInsight id='IN123' handleSubSymptoms={() => {}} />
    )
    
    expect(getByText('Customer experience')).toBeInTheDocument()
    expect(getByText('Summary item 1')).toBeInTheDocument()
    expect(getByText('Recommendations')).toBeInTheDocument()
    expect(getByText('Recommendation 1')).toBeInTheDocument()
  })

  test('should render AIInsight with dark theme', () => {
    useParamsDetails.mockReturnValue({
      theme: { isDark: true, surface: 'dark' },
      acssCallId: 'call123'
    })

    const { container } = render(
      <AIInsight id='IN123' handleSubSymptoms={() => {}} />
    )
    
    expect(container.querySelector('#ai-insight')).toBeInTheDocument()
  })

  test('should render AIInsight with network insight', () => {
    useAIInsightStore.mockReturnValue({
      currentIntent: {},
      intentId: 'IN123',
      isNetworkInsight: true
    })

    const { getByText } = render(
      <AIInsight id='IN123' handleSubSymptoms={() => {}} />
    )
    
    expect(getByText('Network Insights Summary')).toBeInTheDocument()
  })

  test('should render AIInsight with device insight', () => {
    useAIInsightStore.mockReturnValue({
      currentIntent: {},
      intentId: 'IN123',
      isNetworkInsight: false
    })

    const { getByText } = render(
      <AIInsight id='IN123' handleSubSymptoms={() => {}} />
    )
    
    expect(getByText('Device Insights Summary')).toBeInTheDocument()
  })

})

describe('<Summary />', () => {
  beforeEach(() => {
    useParamsDetails.mockReturnValue({
      theme: { isDark: false }
    })
  })

  test('should render Summary component with empty list', () => {
    const { getByText } = render(<Summary list={[]} />)
    expect(getByText('Customer experience')).toBeInTheDocument()
  })

  test('should render Summary component with list items', () => {
    const list = ['Item 1', 'Item 2']
    const { getByText } = render(<Summary list={list} />)
    expect(getByText('Customer experience')).toBeInTheDocument()
    expect(getByText('Item 1')).toBeInTheDocument()
    expect(getByText('Item 2')).toBeInTheDocument()
  })

  test('should render Summary component with dark theme', () => {
    useParamsDetails.mockReturnValue({
      theme: { isDark: true }
    })
    const list = ['Dark item']
    const { getByText } = render(<Summary list={list} />)
    expect(getByText('Dark item')).toBeInTheDocument()
  })

  test('should render Summary component with undefined list', () => {
    const { getByText } = render(<Summary list={undefined} />)
    expect(getByText('Customer experience')).toBeInTheDocument()
  })

  test('should render Summary component with null list', () => {
    const { getByText } = render(<Summary list={null} />)
    expect(getByText('Customer experience')).toBeInTheDocument()
  })
})

describe('<ItemList />', () => {
  test('should render ItemList component with steps', () => {
    const item = { steps: ['Step 1', 'Step 2'] }
    const { getByText } = render(<ItemList item={item} isDark={false} />)
    expect(getByText('Step 1')).toBeInTheDocument()
    expect(getByText('Step 2')).toBeInTheDocument()
  })

  test('should render ItemList component with dark theme', () => {
    const item = { steps: ['Dark step'] }
    const { getByText } = render(<ItemList item={item} isDark={true} />)
    expect(getByText('Dark step')).toBeInTheDocument()
  })

  test('should not render ItemList when steps array is empty', () => {
    const item = { steps: [] }
    const { container } = render(<ItemList item={item} isDark={false} />)
    expect(container.firstChild).toBeNull()
  })

  test('should not render ItemList when steps is undefined', () => {
    const item = {}
    const { container } = render(<ItemList item={item} isDark={false} />)
    expect(container.firstChild).toBeNull()
  })

  test('should not render ItemList when item is null', () => {
    const { container } = render(<ItemList item={null} isDark={false} />)
    expect(container.firstChild).toBeNull()
  })
})

describe('<LinkToArticle />', () => {
  beforeEach(() => {
    useParamsDetails.mockReturnValue({
      theme: { surface: 'light' }
    })
  })

  test('should render LinkToArticle component with URL', () => {
    const { getByText } = render(<LinkToArticle label="Learn more" url="https://example.com" />)
    const link = getByText('Learn more')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com')
    expect(link.closest('a')).toHaveAttribute('target', '_blank')
  })

  test('should not render LinkToArticle when URL is null', () => {
    const { container } = render(<LinkToArticle label="Learn more" url={null} />)
    expect(container.firstChild).toBeNull()
  })

  test('should not render LinkToArticle when URL is undefined', () => {
    const { container } = render(<LinkToArticle label="Learn more" url={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  test('should not render LinkToArticle when URL is empty string', () => {
    const { container } = render(<LinkToArticle label="Learn more" url="" />)
    expect(container.firstChild).toBeNull()
  })

  test('should render LinkToArticle with dark theme surface', () => {
    useParamsDetails.mockReturnValue({
      theme: { surface: 'dark' }
    })
    const { getByText } = render(<LinkToArticle label="Learn more" url="https://example.com" />)
    expect(getByText('Learn more')).toBeInTheDocument()
  })

})

describe('<ContinueTroubleshooting />', () => {
  beforeEach(() => {
    useAIInsightStore.mockReturnValue({
      store: { currentIntent: { id: 'IN123' } }
    })
  })

  test('should render ContinueTroubleshooting component', () => {
    const { getByText } = render(<ContinueTroubleshooting handleSubSymptoms={() => {}} isDark={false} isLoading={false} />)
    expect(getByText('Continue Troubleshooting')).toBeInTheDocument()
  })

  test('should render ContinueTroubleshooting component when loading', () => {
    const { getByText } = render(<ContinueTroubleshooting handleSubSymptoms={() => {}} isDark={false} isLoading={true} />)
    expect(getByText('Continue Troubleshooting')).toBeInTheDocument()
  })

  test('should render ContinueTroubleshooting component with dark theme', () => {
    const { getByText } = render(<ContinueTroubleshooting handleSubSymptoms={() => {}} isDark={true} isLoading={false} />)
    expect(getByText('Continue Troubleshooting')).toBeInTheDocument()
  })

  test('should call handleSubSymptoms when button is clicked', () => {
    const mockHandleSubSymptoms = jest.fn()
    const { getByText } = render(<ContinueTroubleshooting handleSubSymptoms={mockHandleSubSymptoms} isDark={false} isLoading={false} />)
    
    fireEvent.click(getByText('Continue Troubleshooting'))
    expect(mockHandleSubSymptoms).toHaveBeenCalledWith(
      expect.objectContaining({ fromAiContinue: true }), 
      null
    )
  })

  test('should call handleSubSymptoms after 1 minute when loading', () => {
    const mockHandleSubSymptoms = jest.fn()
    render(<ContinueTroubleshooting handleSubSymptoms={mockHandleSubSymptoms} isDark={false} isLoading={true} />)
    
    jest.advanceTimersByTime(60000)
    expect(mockHandleSubSymptoms).toHaveBeenCalled()
  })

  test('should clear timeout when component unmounts', () => {
    const mockHandleSubSymptoms = jest.fn()
    const { unmount } = render(<ContinueTroubleshooting handleSubSymptoms={mockHandleSubSymptoms} isDark={false} isLoading={true} />)
    
    unmount()
    jest.advanceTimersByTime(60000)
    expect(mockHandleSubSymptoms).not.toHaveBeenCalled()
  })
})

describe('<ErrorMessage />', () => {
  beforeEach(() => {
    useParamsDetails.mockReturnValue({
      theme: { isDark: false }
    })
  })

  test('should render ErrorMessage component', () => {
    const { getByText } = render(<ErrorMessage />)
    expect(getByText('Unable to get insights at the moment.')).toBeInTheDocument()
  })

  test('should render ErrorMessage component with dark theme', () => {
    useParamsDetails.mockReturnValue({
      theme: { isDark: true }
    })
    const { getByText } = render(<ErrorMessage />)
    expect(getByText('Unable to get insights at the moment.')).toBeInTheDocument()
  })
})

describe('<FeedbackContainer />', () => {
  test('should render FeedbackContainer component', () => {
    const { container } = render(<FeedbackContainer isDisabled={false} id="test-id" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  test('should render FeedbackContainer component when disabled', () => {
    const { container } = render(<FeedbackContainer isDisabled={true} id="test-id" />)
    expect(container.firstChild).toBeInTheDocument()
  })
})

describe('<IconContainer />', () => {
  beforeEach(() => {
    useParamsDetails.mockReturnValue({
      theme: { surface: 'light' }
    })
  })

  test('should render IconContainer component', () => {
    const { getByTestId } = render(<IconContainer />)
    expect(getByTestId('ideas-solutions')).toBeInTheDocument()
  })

  test('should render IconContainer component with dark theme', () => {
    useParamsDetails.mockReturnValue({
      theme: { surface: 'dark' }
    })
    const { getByTestId } = render(<IconContainer />)
    expect(getByTestId('ideas-solutions')).toBeInTheDocument()
  })
})

describe('<Recommendations />', () => {
  beforeEach(() => {
    useParamsDetails.mockReturnValue({
      theme: { isDark: false }
    })
  })

  test('should render Recommendations component', () => {
    const recommendations = [{ title: 'Test Recommendation', steps: ['Step 1'] }]
    const { getByText } = render(<Recommendations recommendations={recommendations} id="test-id" />)
    expect(getByText('Recommendations')).toBeInTheDocument()
    expect(getByText('Test Recommendation')).toBeInTheDocument()
  })

  test('should render Recommendations component with dark theme', () => {
    useParamsDetails.mockReturnValue({
      theme: { isDark: true }
    })
    const recommendations = [{ title: 'Dark Recommendation', steps: ['Step 1'] }]
    const { getByText } = render(<Recommendations recommendations={recommendations} id="test-id" />)
    expect(getByText('Recommendations')).toBeInTheDocument()
    expect(getByText('Dark Recommendation')).toBeInTheDocument()
  })

  test('should not render Recommendations when recommendations is null', () => {
    const { container } = render(<Recommendations recommendations={null} id="test-id" />)
    expect(container.firstChild).toBeNull()
  })

  test('should not render Recommendations when recommendations is empty array', () => {
    const { container } = render(<Recommendations recommendations={[]} id="test-id" />)
    expect(container.firstChild).toBeNull()
  })

  test('should not render Recommendations when recommendations is undefined', () => {
    const { container } = render(<Recommendations recommendations={undefined} id="test-id" />)
    expect(container.firstChild).toBeNull()
  })
})

describe('<RecommendationItem />', () => {
  beforeEach(() => {
    useParamsDetails.mockReturnValue({
      theme: { isDark: false, surface: 'light' }
    })
  })

  test('should render RecommendationItem component', () => {
    const item = { title: 'Test Item', steps: ['Step 1'], link: 'https://example.com' }
    const { getByText } = render(<RecommendationItem id="test-id" item={item} />)
    expect(getByText('Test Item')).toBeInTheDocument()
    expect(getByText('Step 1')).toBeInTheDocument()
    expect(getByText('Learn more')).toBeInTheDocument()
    expect(getByText('Was this helpful?')).toBeInTheDocument()
  })

  test('should render RecommendationItem component with dark theme', () => {
    useParamsDetails.mockReturnValue({
      theme: { isDark: true, surface: 'dark' }
    })
    const item = { title: 'Dark Item', steps: ['Dark Step'] }
    const { getByText } = render(<RecommendationItem id="test-id" item={item} />)
    expect(getByText('Dark Item')).toBeInTheDocument()
    expect(getByText('Dark Step')).toBeInTheDocument()
  })

  test('should render RecommendationItem without link when link is not provided', () => {
    const item = { title: 'No Link Item', steps: ['Step 1'] }
    const { getByText, queryByText } = render(<RecommendationItem id="test-id" item={item} />)
    expect(getByText('No Link Item')).toBeInTheDocument()
    expect(queryByText('Learn more')).not.toBeInTheDocument()
  })
})

describe('<LoadingSkeleton />', () => {
  test('should render LoadingSkeleton component', () => {
    const { getByText } = render(<LoadingSkeleton isDark={false} />)
    expect(getByText('Summarizing the findings...')).toBeInTheDocument()
  })

  test('should render LoadingSkeleton component with dark theme', () => {
    const { getByText } = render(<LoadingSkeleton isDark={true} />)
    expect(getByText('Summarizing the findings...')).toBeInTheDocument()
  })
})

describe('<Header />', () => {
  test('should render Header component for device insight', () => {
    const { getByText } = render(<Header isDark={false} isNetworkInsight={false} surface="light" isLoading={false} />)
    expect(getByText('Device Insights Summary')).toBeInTheDocument()
  })

  test('should render Header component for network insight', () => {
    const { getByText } = render(<Header isDark={false} isNetworkInsight={true} surface="light" isLoading={false} />)
    expect(getByText('Network Insights Summary')).toBeInTheDocument()
  })

  test('should render Header component with dark theme', () => {
    const { getByText } = render(<Header isDark={true} isNetworkInsight={false} surface="dark" isLoading={false} />)
    expect(getByText('Device Insights Summary')).toBeInTheDocument()
  })

  test('should render Header component with loader when loading', () => {
    const { getByText, getByTestId } = render(<Header isDark={false} isNetworkInsight={false} surface="light" isLoading={true} />)
    expect(getByText('Device Insights Summary')).toBeInTheDocument()
    expect(getByTestId('loader')).toBeInTheDocument()
  })

  test('should not render loader when not loading', () => {
    const { getByText, queryByTestId } = render(<Header isDark={false} isNetworkInsight={false} surface="light" isLoading={false} />)
    expect(getByText('Device Insights Summary')).toBeInTheDocument()
    expect(queryByTestId('loader')).not.toBeInTheDocument()
  })
})

describe('<AIInsightFeedback />', () => {
  beforeEach(() => {
    useParamsDetails.mockReturnValue({
      acssCallId: 'call123'
    })
    useAIInsight.mockReturnValue({
      data: { transactionId: 'tx123' },
      isLoading: false,
      error: null
    })
  })

  test('should render AIInsightFeedback component', () => {
    const { getByTestId } = render(<AIInsightFeedback id="test-id" />)
    expect(getByTestId('feedback')).toBeInTheDocument()
  })

  test('should pass correct props to Feedback component', () => {
    const { getByTestId } = render(
      <AIInsightFeedback 
        id="test-id" 
        label="Test Label" 
        silent={true} 
        recommendation="Test Recommendation" 
      />
    )
    const feedback = getByTestId('feedback')
    expect(feedback).toHaveAttribute('isACSS', 'true')
    expect(feedback).toHaveAttribute('acssCallId', 'call123')
    expect(feedback).toHaveAttribute('vegasTransactionId', 'tx123')
    expect(feedback).toHaveAttribute('label', 'Test Label')
    expect(feedback).toHaveAttribute('silent', 'true')
    expect(feedback).toHaveAttribute('recommendation', 'Test Recommendation')
  })
})
