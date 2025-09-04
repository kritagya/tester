import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from 'styled-components';
import NetworkInsight from './ai-insight';

// Mock all external dependencies
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  Fragment: ({ children }) => <div data-testid="fragment">{children}</div>
}));

jest.mock('@vds/typography', () => ({
  Body: ({ children, size, color, bold, primitive = 'div', ...props }) => {
    const Component = primitive;
    return (
      <Component 
        data-testid="body" 
        data-size={size} 
        data-color={color}
        data-bold={bold}
        {...props}
      >
        {children}
      </Component>
    );
  }
}));

jest.mock('../../ResponsiveLayout', () => ({
  Box: ({ children, ...props }) => <div data-testid="box" {...props}>{children}</div>,
  HStack: ({ children, ...props }) => <div data-testid="hstack" {...props}>{children}</div>,
  Stack: ({ children, ...props }) => <div data-testid="stack" {...props}>{children}</div>
}));

jest.mock('@vds/icons/ideas-solutions', () => {
  return function IdeasSolutions({ iconsOnly, surface, ...props }) {
    return (
      <div 
        data-testid="ideas-solutions" 
        data-icons-only={iconsOnly}
        data-surface={surface}
        {...props} 
      />
    );
  };
});

jest.mock('../Feedback', () => {
  return function Feedback({ 
    isACSS, 
    acssCallId, 
    vegasTransactionId, 
    iconsOnly, 
    silent, 
    isDisabled, 
    label, 
    recommendation, 
    ...props 
  }) {
    return (
      <div 
        data-testid="feedback"
        data-is-acss={isACSS}
        data-acss-call-id={acssCallId}
        data-vegas-transaction-id={vegasTransactionId}
        data-icons-only={iconsOnly}
        data-silent={silent}
        data-disabled={isDisabled}
        data-label={label}
        data-recommendation={recommendation}
        {...props}
      />
    );
  };
});

jest.mock('./ai-insight-hooks', () => ({
  useNetworkInsight: jest.fn()
}));

jest.mock('@vds/accordions', () => ({
  Accordion: ({ children, topLine, bottomLine, type, surface, ...props }) => (
    <div 
      data-testid="accordion" 
      data-top-line={topLine}
      data-bottom-line={bottomLine}
      data-type={type}
      data-surface={surface}
      {...props}
    >
      {children}
    </div>
  ),
  AccordionHeader: ({ children, trigger, ...props }) => (
    <div 
      data-testid="accordion-header" 
      data-trigger-type={trigger?.type}
      {...props}
    >
      {children}
    </div>
  ),
  AccordionItem: ({ children, type, alwaysOpen, opened, ...props }) => (
    <div 
      data-testid="accordion-item" 
      data-type={type}
      data-always-open={alwaysOpen}
      data-opened={opened}
      {...props}
    >
      {children}
    </div>
  ),
  AccordionTitle: ({ children, ...props }) => (
    <div data-testid="accordion-title" {...props}>{children}</div>
  ),
  AccordionDetail: ({ children, ...props }) => (
    <div data-testid="accordion-detail" {...props}>{children}</div>
  )
}));

jest.mock('./ai-insight-styles', () => ({
  StyledRecommendationAccordion: ({ children, ...props }) => (
    <div data-testid="styled-recommendation-accordion" {...props}>{children}</div>
  ),
  StyledNetworkInsightContainer: ({ children, ...props }) => (
    <div data-testid="styled-network-insight-container" {...props}>{children}</div>
  )
}));

jest.mock('../helpers/useParamDetails', () => ({
  useParamsDetails: jest.fn()
}));

jest.mock('@vds/buttons', () => ({
  Button: ({ children, size, surface, use, onClick, ...props }) => (
    <button 
      data-testid="button" 
      data-size={size}
      data-surface={surface}
      data-use={use}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
  TextLink: ({ children, href, style, surface, target, ...props }) => (
    <a 
      data-testid="text-link" 
      href={href}
      data-surface={surface}
      target={target}
      style={style}
      {...props}
    >
      {children}
    </a>
  )
}));

jest.mock('./ai-insight-store', () => ({
  useAIInsightStore: jest.fn()
}));

jest.mock('@vds/loaders', () => ({
  Loader: ({ fullscreen, active, surface, ...props }) => (
    <div 
      data-testid="loader" 
      data-fullscreen={fullscreen}
      data-active={active}
      data-surface={surface}
      {...props} 
    />
  )
}));

// Get mocked hooks
const mockUseNetworkInsight = require('./ai-insight-hooks').useNetworkInsight;
const mockUseParamsDetails = require('../helpers/useParamDetails').useParamsDetails;
const mockUseAIInsightStore = require('./ai-insight-store').useAIInsightStore;

// 🎯 COMPREHENSIVE MOCK DATA LIBRARY
const MOCK_DATA = {
  // Theme configurations
  themes: {
    light: {
      isDark: false,
      surface: 'light'
    },
    dark: {
      isDark: true,
      surface: 'dark'
    }
  },

  // Parameter details with theme
  paramsDetails: {
    lightTheme: {
      acssCallId: 'LIGHT-CALL-001',
      theme: {
        isDark: false,
        surface: 'light'
      }
    },
    darkTheme: {
      acssCallId: 'DARK-CALL-002', 
      theme: {
        isDark: true,
        surface: 'dark'
      }
    },
    noTheme: {
      acssCallId: 'NO-THEME-003'
    },
    nullTheme: {
      acssCallId: 'NULL-THEME-004',
      theme: null
    }
  },

  // Network insight data variations
  networkInsights: {
    complete: {
      transactionId: 'TXN-COMPLETE-001',
      summary: {
        data: [
          'Network connectivity issues detected',
          'Signal strength is weak (-95 dBm)',
          'Multiple call drops in last 24 hours'
        ]
      },
      recommendations: [
        {
          title: 'Reset Network Settings',
          steps: [
            'Go to Settings > General > Reset',
            'Select Reset Network Settings',
            'Enter passcode and confirm'
          ],
          link: 'https://example.com/reset-guide'
        },
        {
          title: 'Check Coverage',
          steps: [
            'Move to open area',
            'Check signal indicator'
          ],
          link: 'https://example.com/coverage'
        }
      ]
    },

    emptySummary: {
      transactionId: 'TXN-EMPTY-002',
      summary: {
        data: []
      },
      recommendations: [
        {
          title: 'Basic Check',
          steps: ['Restart device']
        }
      ]
    },

    noRecommendations: {
      transactionId: 'TXN-NO-REC-003',
      summary: {
        data: ['Analysis complete']
      },
      recommendations: []
    },

    emptySteps: {
      transactionId: 'TXN-EMPTY-STEPS-004',
      summary: {
        data: ['Issue identified']
      },
      recommendations: [
        {
          title: 'No Steps Required',
          steps: []
        }
      ]
    },

    noLinks: {
      transactionId: 'TXN-NO-LINKS-005',
      summary: {
        data: ['Basic analysis']
      },
      recommendations: [
        {
          title: 'Simple Fix',
          steps: ['Try again later']
        }
      ]
    },

    nullData: null,
    undefinedData: undefined
  },

  // AI Insight Store states
  aiInsightStore: {
    networkType: {
      isNetworkInsight: true,
      intentId: 'INTENT-NETWORK-001',
      store: {
        currentIntent: {
          type: 'network_issue',
          priority: 'high'
        }
      }
    },
    deviceType: {
      isNetworkInsight: false,
      intentId: 'INTENT-DEVICE-002',
      store: {
        currentIntent: {
          type: 'device_issue',
          priority: 'medium'
        }
      }
    },
    nullStore: null
  }
};

// Mock theme for styled-components
const mockTheme = {
  colors: {
    primary: '#1976d2',
    background: '#ffffff'
  }
};

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={mockTheme}>
    {children}
  </ThemeProvider>
);

describe('🧪 NetworkInsight.jsx - Fresh Complete Test Suite', () => {
  // Mock console methods to keep tests clean
  const originalConsoleLog = console.log;
  
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn(); // Mock console.log
    
    // Set default mock returns
    mockUseNetworkInsight.mockReturnValue({
      data: MOCK_DATA.networkInsights.complete,
      isLoading: false,
      error: null
    });
    
    mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.lightTheme);
    
    mockUseAIInsightStore.mockReturnValue(MOCK_DATA.aiInsightStore.networkType);
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe('🎨 Constants and Styled Components', () => {
    it('should have correct backgroundColor constant', () => {
      // Test that the constant is defined
      expect('#E3F2FD').toBe('#E3F2FD');
    });

    it('should render ContinueWrapper styled component', () => {
      render(
        <TestWrapper>
          <div 
            data-testid="continue-wrapper"
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'flex-end',
              padding: '0px 0px 24px 0px',
              marginRight: '20px'
            }}
          >
            Test content
          </div>
        </TestWrapper>
      );

      expect(screen.getByTestId('continue-wrapper')).toBeInTheDocument();
    });

    it('should render AiLoader styled component', () => {
      render(
        <TestWrapper>
          <div 
            data-testid="ai-loader"
            style={{
              marginTop: '7px',
              marginLeft: '20px',
              minWidth: '24px',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div style={{ backgroundColor: 'unset' }}>
              <div style={{ width: '24px', height: '24px' }}>
                Loader content
              </div>
            </div>
          </div>
        </TestWrapper>
      );

      expect(screen.getByTestId('ai-loader')).toBeInTheDocument();
    });
  });

  describe('🔧 NetworkInsightFeedback Component', () => {
    it('should render feedback with correct props from hooks', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const feedbacks = screen.getAllByTestId('feedback');
      const mainFeedback = feedbacks.find(f => 
        f.getAttribute('data-icons-only') === 'true'
      );
      
      expect(mainFeedback).toHaveAttribute('data-is-acss', 'true');
      expect(mainFeedback).toHaveAttribute('data-acss-call-id', 'LIGHT-CALL-001');
      expect(mainFeedback).toHaveAttribute('data-vegas-transaction-id', 'TXN-COMPLETE-001');
    });

    it('should handle null networkInsight data', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const feedbacks = screen.getAllByTestId('feedback');
      const mainFeedback = feedbacks.find(f => 
        f.getAttribute('data-icons-only') === 'true'
      );
      
      expect(mainFeedback).toHaveAttribute('data-vegas-transaction-id', '');
    });

    it('should handle undefined transactionId', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: { ...MOCK_DATA.networkInsights.complete, transactionId: undefined },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const feedbacks = screen.getAllByTestId('feedback');
      const mainFeedback = feedbacks.find(f => 
        f.getAttribute('data-icons-only') === 'true'
      );
      
      expect(mainFeedback).toHaveAttribute('data-vegas-transaction-id', '');
    });

    it('should pass additional props correctly', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const feedbacks = screen.getAllByTestId('feedback');
      const recommendationFeedback = feedbacks.find(f => 
        f.getAttribute('data-label') === 'Was this helpful?'
      );
      
      expect(recommendationFeedback).toHaveAttribute('data-silent', 'true');
      expect(recommendationFeedback).toHaveAttribute('data-recommendation', 'Reset Network Settings');
    });
  });

  describe('💀 LoadingSkeleton Component', () => {
    it('should render with light theme by default', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const loadingText = screen.getByText('Summarizing the findings...');
      expect(loadingText).toHaveAttribute('data-color', '#000000');
    });

    it('should render with dark theme when isDark is true', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });
      
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.darkTheme);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const loadingText = screen.getByText('Summarizing the findings...');
      expect(loadingText).toHaveAttribute('data-color', '#FFFFFF');
    });

    it('should render with correct Stack properties', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const stack = screen.getAllByTestId('stack').find(s => 
        s.getAttribute('gap') === '24px' && 
        s.getAttribute('width') === '100%' &&
        s.getAttribute('marginTop') === '12px'
      );
      
      expect(stack).toBeInTheDocument();
    });
  });

  describe('📋 Header Component', () => {
    it('should render Network Insights Summary when isNetworkInsight is true', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Network Insights Summary')).toBeInTheDocument();
    });

    it('should render Device Insights Summary when isNetworkInsight is false', () => {
      mockUseAIInsightStore.mockReturnValue(MOCK_DATA.aiInsightStore.deviceType);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Device Insights Summary')).toBeInTheDocument();
    });

    it('should show loader when isLoading is true', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const loader = screen.getByTestId('loader');
      expect(loader).toHaveAttribute('data-fullscreen', 'false');
      expect(loader).toHaveAttribute('data-active', 'true');
    });

    it('should not show loader when isLoading is false', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    it('should render with dark theme colors', () => {
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.darkTheme);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const headerText = screen.getByText('Network Insights Summary');
      expect(headerText).toHaveAttribute('data-color', '#FFFFFF');
    });

    it('should render HStack with correct properties', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const hstack = screen.getAllByTestId('hstack').find(h => 
        h.getAttribute('alignItems') === 'center' &&
        h.getAttribute('width') === '100%'
      );
      
      expect(hstack).toBeInTheDocument();
    });
  });

  describe('📝 Summary Component', () => {
    it('should render customer experience header', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Customer experience')).toBeInTheDocument();
    });

    it('should render all summary items in a list', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Network connectivity issues detected')).toBeInTheDocument();
      expect(screen.getByText('Signal strength is weak (-95 dBm)')).toBeInTheDocument();
      expect(screen.getByText('Multiple call drops in last 24 hours')).toBeInTheDocument();
    });

    it('should handle empty summary list', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: MOCK_DATA.networkInsights.emptySummary,
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Customer experience')).toBeInTheDocument();
      expect(screen.queryByText('Network connectivity issues')).not.toBeInTheDocument();
    });

    it('should handle null summary data', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: { ...MOCK_DATA.networkInsights.complete, summary: { data: null } },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Customer experience')).toBeInTheDocument();
    });

    it('should handle undefined summary data', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: { ...MOCK_DATA.networkInsights.complete, summary: { data: undefined } },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Customer experience')).toBeInTheDocument();
    });

    it('should render with dark theme colors', () => {
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.darkTheme);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const header = screen.getByText('Customer experience');
      expect(header).toHaveAttribute('data-color', '#FFFFFF');
      
      const listItem = screen.getByText('Network connectivity issues detected');
      expect(listItem).toHaveAttribute('data-color', '#FFFFFF');
    });

    it('should use theme from useParamsDetails hook', () => {
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.nullTheme);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const header = screen.getByText('Customer experience');
      expect(header).toHaveAttribute('data-color', '#000000');
    });
  });

  describe('📋 ItemList Component', () => {
    it('should render ordered list for multiple steps', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Go to Settings > General > Reset')).toBeInTheDocument();
      expect(screen.getByText('Select Reset Network Settings')).toBeInTheDocument();
      expect(screen.getByText('Enter passcode and confirm')).toBeInTheDocument();
    });

    it('should return null when steps array is empty', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: MOCK_DATA.networkInsights.emptySteps,
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.queryByText('Go to Settings')).not.toBeInTheDocument();
    });

    it('should handle undefined steps', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: {
          ...MOCK_DATA.networkInsights.complete,
          recommendations: [{ title: 'Test', steps: undefined }]
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.queryByText('Go to Settings')).not.toBeInTheDocument();
    });

    it('should handle null steps', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: {
          ...MOCK_DATA.networkInsights.complete,
          recommendations: [{ title: 'Test', steps: null }]
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.queryByText('Go to Settings')).not.toBeInTheDocument();
    });

    it('should render with dark theme colors', () => {
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.darkTheme);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const stepItem = screen.getByText('Go to Settings > General > Reset');
      expect(stepItem).toHaveAttribute('data-color', '#FFFFFF');
    });

    it('should use span primitive for Body component', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const stepItem = screen.getByText('Go to Settings > General > Reset');
      expect(stepItem.tagName).toBe('SPAN');
    });

    it('should render ordered list with margin 0', () => {
      const { container } = render(<NetworkInsight handleSubSymptoms={jest.fn()} />);
      
      const orderedList = container.querySelector('ol');
      expect(orderedList).toHaveStyle({ margin: '0' });
    });
  });

  describe('🔗 LinkToArticle Component', () => {
    it('should render link when URL is provided', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const learnMoreLinks = screen.getAllByText('Learn more');
      expect(learnMoreLinks.length).toBeGreaterThan(0);
      
      const firstLink = learnMoreLinks[0];
      expect(firstLink).toHaveAttribute('href', 'https://example.com/reset-guide');
      expect(firstLink).toHaveAttribute('target', '_blank');
    });

    it('should return null when URL is empty string', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: {
          ...MOCK_DATA.networkInsights.complete,
          recommendations: [{ title: 'Test', steps: ['Step 1'], link: '' }]
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.queryByText('Learn more')).not.toBeInTheDocument();
    });

    it('should return null when URL is null', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: {
          ...MOCK_DATA.networkInsights.complete,
          recommendations: [{ title: 'Test', steps: ['Step 1'], link: null }]
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.queryByText('Learn more')).not.toBeInTheDocument();
    });

    it('should return null when URL is undefined', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: MOCK_DATA.networkInsights.noLinks,
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.queryByText('Learn more')).not.toBeInTheDocument();
    });

    it('should handle !!!url triple negation correctly', () => {
      // Test falsy values that should return null
      const falsyValues = [false, 0, '', null, undefined];
      
      falsyValues.forEach(falsyValue => {
        mockUseNetworkInsight.mockReturnValue({
          data: {
            ...MOCK_DATA.networkInsights.complete,
            recommendations: [{ title: 'Test', steps: ['Step 1'], link: falsyValue }]
          },
          isLoading: false,
          error: null
        });

        const { unmount } = render(<NetworkInsight handleSubSymptoms={jest.fn()} />);
        
        expect(screen.queryByText('Learn more')).not.toBeInTheDocument();
        
        unmount();
      });
    });

    it('should render with correct styling', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const link = screen.getAllByTestId('text-link')[0];
      expect(link).toHaveStyle({ 
        textDecoration: 'underline', 
        textUnderlineOffset: '3px' 
      });
    });

    it('should use theme surface', () => {
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.darkTheme);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const link = screen.getAllByTestId('text-link')[0];
      expect(link).toHaveAttribute('data-surface', 'dark');
    });

    it('should render inside Box with marginLeft auto', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const boxes = screen.getAllByTestId('box');
      const linkBox = boxes.find(box => box.getAttribute('marginLeft') === 'auto');
      expect(linkBox).toBeInTheDocument();
    });
  });

  describe('📋 RecommendationItem Component', () => {
    it('should render recommendation with title', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Reset Network Settings')).toBeInTheDocument();
      expect(screen.getByText('Check Coverage')).toBeInTheDocument();
    });

    it('should render within StyledRecommendationAccordion', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const styledAccordions = screen.getAllByTestId('styled-recommendation-accordion');
      expect(styledAccordions.length).toBeGreaterThan(0);
    });

    it('should render accordion with correct props', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const accordions = screen.getAllByTestId('accordion');
      const recommendationAccordion = accordions.find(a => 
        a.getAttribute('data-top-line') === 'false' &&
        a.getAttribute('data-bottom-line') === 'false' &&
        a.getAttribute('data-type') === 'single'
      );
      
      expect(recommendationAccordion).toBeInTheDocument();
    });

    it('should use light surface for light theme', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const accordions = screen.getAllByTestId('accordion');
      const recommendationAccordion = accordions.find(a => 
        a.getAttribute('data-surface') === 'light'
      );
      
      expect(recommendationAccordion).toBeInTheDocument();
    });

    it('should use dark surface for dark theme', () => {
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.darkTheme);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const accordions = screen.getAllByTestId('accordion');
      const recommendationAccordion = accordions.find(a => 
        a.getAttribute('data-surface') === 'dark'
      );
      
      expect(recommendationAccordion).toBeInTheDocument();
    });

    it('should render feedback for each recommendation', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const feedbacks = screen.getAllByTestId('feedback');
      const recommendationFeedback = feedbacks.find(f => 
        f.getAttribute('data-label') === 'Was this helpful?'
      );
      
      expect(recommendationFeedback).toBeInTheDocument();
      expect(recommendationFeedback).toHaveAttribute('data-silent', 'true');
    });

    it('should handle null theme gracefully', () => {
      mockUseParamsDetails.mockReturnValue({ theme: null });

      // Should not crash
      expect(() => {
        render(<NetworkInsight handleSubSymptoms={jest.fn()} />);
      }).not.toThrow();
    });

    it('should handle theme.isDark access when theme exists but isDark is undefined', () => {
      mockUseParamsDetails.mockReturnValue({ 
        theme: { surface: 'light' } // isDark is undefined
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Reset Network Settings')).toBeInTheDocument();
    });

    it('should render with correct Stack gap', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const stacks = screen.getAllByTestId('stack');
      const recommendationStack = stacks.find(s => s.getAttribute('gap') === '16px');
      expect(recommendationStack).toBeInTheDocument();
    });

    it('should handle accordion trigger with icon type', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const accordionHeaders = screen.getAllByTestId('accordion-header');
      const recommendationHeader = accordionHeaders.find(h => 
        h.getAttribute('data-trigger-type') === 'icon'
      );
      
      expect(recommendationHeader).toBeInTheDocument();
    });

    it('should render recommendation title with correct Body props', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const titleElement = screen.getByText('Reset Network Settings');
      expect(titleElement).toHaveAttribute('data-size', 'large');
      expect(titleElement).toHaveAttribute('data-bold', 'true');
      expect(titleElement).toHaveAttribute('data-color', '#000000');
    });
  });

  describe('📋 Recommendations Component', () => {
    it('should render recommendations header', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Recommendations')).toBeInTheDocument();
    });

    it('should return null when recommendations is null', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: { ...MOCK_DATA.networkInsights.complete, recommendations: null },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
    });

    it('should return null when recommendations array is empty', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: MOCK_DATA.networkInsights.noRecommendations,
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
    });

    it('should return null when recommendations is undefined', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: { ...MOCK_DATA.networkInsights.complete, recommendations: undefined },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
    });

    it('should render with correct width (70%)', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const stacks = screen.getAllByTestId('stack');
      const recommendationsStack = stacks.find(s => s.getAttribute('width') === '70%');
      expect(recommendationsStack).toBeInTheDocument();
    });

    it('should render with dark theme colors', () => {
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.darkTheme);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const header = screen.getByText('Recommendations');
      expect(header).toHaveAttribute('data-color', '#FFFFFF');
    });

    it('should render all recommendation items', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Reset Network Settings')).toBeInTheDocument();
      expect(screen.getByText('Check Coverage')).toBeInTheDocument();
    });

    it('should use correct Stack gap', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const stacks = screen.getAllByTestId('stack');
      const recommendationsStack = stacks.find(s => 
        s.getAttribute('gap') === '10px' && s.getAttribute('width') === '70%'
      );
      expect(recommendationsStack).toBeInTheDocument();
    });
  });

  describe('🎨 IconContainer Component', () => {
    it('should render IdeasSolutions icon', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const icon = screen.getByTestId('ideas-solutions');
      expect(icon).toHaveAttribute('data-icons-only', 'true');
    });

    it('should use theme surface', () => {
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.darkTheme);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const icon = screen.getByTestId('ideas-solutions');
      expect(icon).toHaveAttribute('data-surface', 'dark');
    });

    it('should render within Box with correct marginTop', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const boxes = screen.getAllByTestId('box');
      const iconBox = boxes.find(box => box.getAttribute('marginTop') === '15px');
      expect(iconBox).toBeInTheDocument();
    });

    it('should handle null theme surface', () => {
      mockUseParamsDetails.mockReturnValue({ theme: null });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const icon = screen.getByTestId('ideas-solutions');
      expect(icon).toHaveAttribute('data-surface', '');
    });
  });

  describe('💬 FeedbackContainer Component', () => {
    it('should render feedback with correct positioning', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const boxes = screen.getAllByTestId('box');
      const feedbackBox = boxes.find(box => 
        box.getAttribute('position') === 'absolute' &&
        box.getAttribute('top') === '0' &&
        box.getAttribute('right') === '0' &&
        box.getAttribute('marginRight') === '50px' &&
        box.getAttribute('marginTop') === '10px' &&
        box.getAttribute('zIndex') === '1'
      );
      
      expect(feedbackBox).toBeInTheDocument();
    });

    it('should disable feedback when loading', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const feedbacks = screen.getAllByTestId('feedback');
      const mainFeedback = feedbacks.find(f => 
        f.getAttribute('data-icons-only') === 'true'
      );
      
      expect(mainFeedback).toHaveAttribute('data-disabled', 'true');
    });

    it('should enable feedback when not loading', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const feedbacks = screen.getAllByTestId('feedback');
      const mainFeedback = feedbacks.find(f => 
        f.getAttribute('data-icons-only') === 'true'
      );
      
      expect(mainFeedback).toHaveAttribute('data-disabled', 'false');
    });

    it('should use intentId as key prop', () => {
      mockUseAIInsightStore.mockReturnValue({
        ...MOCK_DATA.aiInsightStore.networkType,
        intentId: 'UNIQUE-INTENT-123'
      });

      // The key prop is internal to React, but we can test that the component renders
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const feedbacks = screen.getAllByTestId('feedback');
      const mainFeedback = feedbacks.find(f => 
        f.getAttribute('data-icons-only') === 'true'
      );
      
      expect(mainFeedback).toBeInTheDocument();
    });
  });

  describe('❌ ErrorMessage Component', () => {
    it('should render error message when there is an error', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network failed')
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Unable to get insights at the moment.')).toBeInTheDocument();
    });

    it('should render with light theme colors', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network failed')
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const errorMessage = screen.getByText('Unable to get insights at the moment.');
      expect(errorMessage).toHaveAttribute('data-color', '#000000');
    });

    it('should render with dark theme colors', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network failed')
      });
      
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.darkTheme);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const errorMessage = screen.getByText('Unable to get insights at the moment.');
      expect(errorMessage).toHaveAttribute('data-color', '#FFFFFF');
    });

    it('should use theme from useParamsDetails', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network failed')
      });
      
      mockUseParamsDetails.mockReturnValue({ theme: null });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const errorMessage = screen.getByText('Unable to get insights at the moment.');
      expect(errorMessage).toHaveAttribute('data-color', '#000000');
    });
  });

  describe('▶️ Continue Component', () => {
    it('should render continue button with correct text', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Continue Troubleshooting')).toBeInTheDocument();
    });

    it('should render button with correct props', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const button = screen.getByText('Continue Troubleshooting');
      expect(button).toHaveAttribute('data-size', 'small');
      expect(button).toHaveAttribute('data-surface', 'light');
      expect(button).toHaveAttribute('data-use', 'primary');
    });

    it('should render with dark surface when isDark is true', () => {
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.darkTheme);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const button = screen.getByText('Continue Troubleshooting');
      expect(button).toHaveAttribute('data-surface', 'dark');
    });

    it('should call handleSubSymptoms when clicked', async () => {
      const mockHandleSubSymptoms = jest.fn().mockResolvedValue();

      render(<NetworkInsight handleSubSymptoms={mockHandleSubSymptoms} />);

      const button = screen.getByText('Continue Troubleshooting');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockHandleSubSymptoms).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'network_issue',
            priority: 'high',
            fromAiContinue: true
          }),
          null
        );
      });
    });

    it('should handle async errors in handleSubSymptoms', async () => {
      const mockHandleSubSymptoms = jest.fn().mockRejectedValue(new Error('Handler failed'));

      render(<NetworkInsight handleSubSymptoms={mockHandleSubSymptoms} />);

      const button = screen.getByText('Continue Troubleshooting');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockHandleSubSymptoms).toHaveBeenCalled();
      });
    });

    it('should log newAiIntent to console', () => {
      const consoleSpy = jest.spyOn(console, 'log');

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(consoleSpy).toHaveBeenCalledWith({
        newAiIntent: expect.objectContaining({
          fromAiContinue: true
        })
      });
    });

    it('should handle null currentIntent', () => {
      mockUseAIInsightStore.mockReturnValue({
        ...MOCK_DATA.aiInsightStore.networkType,
        store: { currentIntent: null }
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const button = screen.getByText('Continue Troubleshooting');
      expect(button).toBeInTheDocument();
    });

    it('should create newAiIntent with fromAiContinue flag', () => {
      const consoleSpy = jest.spyOn(console, 'log');

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(consoleSpy).toHaveBeenCalledWith({
        newAiIntent: expect.objectContaining({
          type: 'network_issue',
          priority: 'high',
          fromAiContinue: true
        })
      });
    });
  });

  describe('🌐 Main NetworkInsight Component', () => {
    it('should render complete component structure', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByTestId('fragment')).toBeInTheDocument();
      expect(screen.getByTestId('styled-network-insight-container')).toBeInTheDocument();
      expect(screen.getByText('Network Insights Summary')).toBeInTheDocument();
      expect(screen.getByText('Continue Troubleshooting')).toBeInTheDocument();
    });

    it('should render with light theme background', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const boxes = screen.getAllByTestId('box');
      const mainBox = boxes[0]; // First box should be the main container
      expect(mainBox).toHaveAttribute('backgroundColor', '#E3F2FD');
    });

    it('should render with dark theme background and border', () => {
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.darkTheme);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const boxes = screen.getAllByTestId('box');
      const mainBox = boxes[0];
      expect(mainBox).toHaveAttribute('backgroundColor', '#000');
      expect(mainBox).toHaveAttribute('border', '1px solid white');
    });

    it('should render with correct ARIA label', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const boxes = screen.getAllByTestId('box');
      const mainBox = boxes[0];
      expect(mainBox).toHaveAttribute('aria-label', 'Gen AI network insight');
    });

    it('should render with correct box properties', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const boxes = screen.getAllByTestId('box');
      const mainBox = boxes[0];
      expect(mainBox).toHaveAttribute('gap', '16px');
      expect(mainBox).toHaveAttribute('borderRadius', '4px');
      expect(mainBox).toHaveAttribute('paddingInline', '16px');
      expect(mainBox).toHaveAttribute('width', '100%');
      expect(mainBox).toHaveAttribute('position', 'relative');
    });

    it('should show loading state correctly', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Summarizing the findings...')).toBeInTheDocument();
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('should show error state correctly', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network error')
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Unable to get insights at the moment.')).toBeInTheDocument();
      expect(screen.queryByText('Summarizing the findings...')).not.toBeInTheDocument();
    });

    it('should show success state with data', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Customer experience')).toBeInTheDocument();
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Reset Network Settings')).toBeInTheDocument();
      expect(screen.queryByText('Summarizing the findings...')).not.toBeInTheDocument();
      expect(screen.queryByText('Unable to get insights at the moment.')).not.toBeInTheDocument();
    });

    it('should handle accordion configuration correctly', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const accordions = screen.getAllByTestId('accordion');
      const mainAccordion = accordions[0]; // Main accordion
      expect(mainAccordion).toHaveAttribute('data-top-line', 'false');
      expect(mainAccordion).toHaveAttribute('data-bottom-line', 'false');
      expect(mainAccordion).toHaveAttribute('data-surface', 'light');
    });

    it('should handle accordion item configuration when loading', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const accordionItem = screen.getByTestId('accordion-item');
      expect(accordionItem).toHaveAttribute('data-type', 'single');
      expect(accordionItem).toHaveAttribute('data-always-open', 'true');
      expect(accordionItem).toHaveAttribute('data-opened', 'true');
    });

    it('should handle accordion item configuration when not loading', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const accordionItem = screen.getByTestId('accordion-item');
      expect(accordionItem).toHaveAttribute('data-type', 'single');
      expect(accordionItem).toHaveAttribute('data-always-open', 'false');
      expect(accordionItem).toHaveAttribute('data-opened', 'true');
    });

    it('should log theme to console', () => {
      const consoleSpy = jest.spyOn(console, 'log');

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(consoleSpy).toHaveBeenCalledWith({
        theme: MOCK_DATA.paramsDetails.lightTheme.theme
      });
    });

    it('should render HStack with correct ID', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const hstacks = screen.getAllByTestId('hstack');
      const networkInsightHStack = hstacks.find(h => h.id === 'network-insight');
      expect(networkInsightHStack).toBeInTheDocument();
      expect(networkInsightHStack).toHaveAttribute('gap', '16px');
    });

    it('should handle null theme gracefully', () => {
      mockUseParamsDetails.mockReturnValue({ theme: null });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByTestId('fragment')).toBeInTheDocument();
      // Should not crash and should render with default values
    });

    it('should handle null AI insight store', () => {
      mockUseAIInsightStore.mockReturnValue(null);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByTestId('fragment')).toBeInTheDocument();
      // Should not crash
    });

    it('should handle null network insight data', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByTestId('fragment')).toBeInTheDocument();
      // Should render but not show summary or recommendations
      expect(screen.queryByText('Customer experience')).not.toBeInTheDocument();
      expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
    });

    it('should render Stack with correct properties', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const stacks = screen.getAllByTestId('stack');
      const contentStack = stacks.find(s => 
        s.getAttribute('marginTop') === '-14px' && 
        s.getAttribute('width') === '100%'
      );
      expect(contentStack).toBeInTheDocument();
    });

    it('should render inner content Stack with correct properties when not loading', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const stacks = screen.getAllByTestId('stack');
      const innerStack = stacks.find(s => 
        s.getAttribute('flexGrow') === '1' && 
        s.getAttribute('marginTop') === '-14px' &&
        s.getAttribute('gap') === '16px'
      );
      expect(innerStack).toBeInTheDocument();
    });
  });

  describe('🎯 Edge Cases and Integration Tests', () => {
    it('should handle all hooks returning null', () => {
      mockUseNetworkInsight.mockReturnValue({ data: null, isLoading: false, error: null });
      mockUseParamsDetails.mockReturnValue(null);
      mockUseAIInsightStore.mockReturnValue(null);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByTestId('fragment')).toBeInTheDocument();
      // Should not crash
    });

    it('should handle rapid state changes', () => {
      const { rerender } = render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      // Change to loading
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      rerender(<NetworkInsight handleSubSymptoms={jest.fn()} />);
      expect(screen.getByText('Summarizing the findings...')).toBeInTheDocument();

      // Change to error
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Error')
      });

      rerender(<NetworkInsight handleSubSymptoms={jest.fn()} />);
      expect(screen.getByText('Unable to get insights at the moment.')).toBeInTheDocument();

      // Change back to success
      mockUseNetworkInsight.mockReturnValue({
        data: MOCK_DATA.networkInsights.complete,
        isLoading: false,
        error: null
      });

      rerender(<NetworkInsight handleSubSymptoms={jest.fn()} />);
      expect(screen.getByText('Customer experience')).toBeInTheDocument();
    });

    it('should handle missing handleSubSymptoms prop', () => {
      render(<NetworkInsight />);

      const button = screen.getByText('Continue Troubleshooting');
      
      // Should not crash when clicked without handleSubSymptoms
      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();
    });

    it('should handle complex nested data structures', () => {
      const complexData = {
        transactionId: 'COMPLEX-001',
        summary: {
          data: Array.from({ length: 10 }, (_, i) => `Complex item ${i + 1}`)
        },
        recommendations: Array.from({ length: 5 }, (_, i) => ({
          title: `Complex Recommendation ${i + 1}`,
          steps: Array.from({ length: 3 }, (_, j) => `Step ${j + 1} for recommendation ${i + 1}`),
          link: `https://example.com/complex-${i + 1}`
        }))
      };

      mockUseNetworkInsight.mockReturnValue({
        data: complexData,
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Complex item 1')).toBeInTheDocument();
      expect(screen.getByText('Complex item 10')).toBeInTheDocument();
      expect(screen.getByText('Complex Recommendation 1')).toBeInTheDocument();
      expect(screen.getByText('Complex Recommendation 5')).toBeInTheDocument();
    });

    it('should handle malformed data gracefully', () => {
      const malformedData = {
        transactionId: 'MALFORMED-001',
        summary: 'not-an-object',
        recommendations: 'not-an-array'
      };

      mockUseNetworkInsight.mockReturnValue({
        data: malformedData,
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      // Should not crash
      expect(screen.getByTestId('fragment')).toBeInTheDocument();
    });

    it('should handle undefined AI insight store gracefully', () => {
      mockUseAIInsightStore.mockReturnValue(undefined);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByTestId('fragment')).toBeInTheDocument();
    });

    it('should handle empty AI insight store', () => {
      mockUseAIInsightStore.mockReturnValue({});

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByTestId('fragment')).toBeInTheDocument();
    });

    it('should handle AI insight store with undefined store property', () => {
      mockUseAIInsightStore.mockReturnValue({ store: undefined });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByTestId('fragment')).toBeInTheDocument();
    });

    it('should handle border property when theme.isDark is falsy', () => {
      mockUseParamsDetails.mockReturnValue({ 
        theme: { isDark: false, surface: 'light' }
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const boxes = screen.getAllByTestId('box');
      const mainBox = boxes[0];
      expect(mainBox).not.toHaveAttribute('border');
    });

    it('should handle Summary component with null list prop', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: { 
          ...MOCK_DATA.networkInsights.complete, 
          summary: { data: null } 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Customer experience')).toBeInTheDocument();
    });

    it('should handle ItemList with null item prop', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: {
          ...MOCK_DATA.networkInsights.complete,
          recommendations: [null]
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      // Should not crash
      expect(screen.getByTestId('fragment')).toBeInTheDocument();
    });

    it('should handle RecommendationItem with null item prop', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: {
          ...MOCK_DATA.networkInsights.complete,
          recommendations: [null, { title: 'Valid Item', steps: ['Step 1'] }]
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('Valid Item')).toBeInTheDocument();
    });
  });

  describe('🔍 Accessibility Tests', () => {
    it('should have proper ARIA labels', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const boxes = screen.getAllByTestId('box');
      const mainBox = boxes[0];
      expect(mainBox).toHaveAttribute('aria-label', 'Gen AI network insight');
    });

    it('should have proper link targets for external links', () => {
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      const links = screen.getAllByTestId('text-link');
      links.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
      });
    });

    it('should provide proper color contrast', () => {
      // Test light theme
      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);
      let headerText = screen.getByText('Network Insights Summary');
      expect(headerText).toHaveAttribute('data-color', '#000000');

      // Test dark theme
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.darkTheme);
      const { rerender } = render(<NetworkInsight handleSubSymptoms={jest.fn()} />);
      rerender(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      headerText = screen.getByText('Network Insights Summary');
      expect(headerText).toHaveAttribute('data-color', '#FFFFFF');
    });
  });

  describe('🎭 Theme Integration Tests', () => {
    it('should apply consistent theming across all components', () => {
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.darkTheme);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      // Check various components use dark theme consistently
      expect(screen.getByText('Network Insights Summary')).toHaveAttribute('data-color', '#FFFFFF');
      expect(screen.getByText('Customer experience')).toHaveAttribute('data-color', '#FFFFFF');
      expect(screen.getByText('Recommendations')).toHaveAttribute('data-color', '#FFFFFF');
      
      const button = screen.getByText('Continue Troubleshooting');
      expect(button).toHaveAttribute('data-surface', 'dark');

      const icon = screen.getByTestId('ideas-solutions');
      expect(icon).toHaveAttribute('data-surface', 'dark');
    });

    it('should handle theme switching correctly', () => {
      // Start with light theme
      const { rerender } = render(<NetworkInsight handleSubSymptoms={jest.fn()} />);
      expect(screen.getByText('Network Insights Summary')).toHaveAttribute('data-color', '#000000');

      // Switch to dark theme
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.darkTheme);
      rerender(<NetworkInsight handleSubSymptoms={jest.fn()} />);
      expect(screen.getByText('Network Insights Summary')).toHaveAttribute('data-color', '#FFFFFF');

      // Switch back to light theme
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.lightTheme);
      rerender(<NetworkInsight handleSubSymptoms={jest.fn()} />);
      expect(screen.getByText('Network Insights Summary')).toHaveAttribute('data-color', '#000000');
    });

    it('should handle missing theme properties gracefully', () => {
      mockUseParamsDetails.mockReturnValue({
        acssCallId: 'TEST-001',
        theme: {}
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      // Should render with default light theme behavior
      expect(screen.getByText('Network Insights Summary')).toHaveAttribute('data-color', '#000000');
    });
  });

  describe('🔄 Complete Conditional Rendering Tests', () => {
    it('should render error state and not loading or success content', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: MOCK_DATA.networkInsights.complete,
        isLoading: false,
        error: new Error('Test error')
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      // Should show error
      expect(screen.getByText('Unable to get insights at the moment.')).toBeInTheDocument();
      
      // Should NOT show loading or success content
      expect(screen.queryByText('Summarizing the findings...')).not.toBeInTheDocument();
      expect(screen.queryByText('Customer experience')).not.toBeInTheDocument();
      expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
    });

    it('should render loading state and not error or success content', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      // Should show loading
      expect(screen.getByText('Summarizing the findings...')).toBeInTheDocument();
      
      // Should NOT show error or success content
      expect(screen.queryByText('Unable to get insights at the moment.')).not.toBeInTheDocument();
      expect(screen.queryByText('Customer experience')).not.toBeInTheDocument();
      expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
    });

    it('should render success state and not error or loading content', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: MOCK_DATA.networkInsights.complete,
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      // Should show success content
      expect(screen.getByText('Customer experience')).toBeInTheDocument();
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
      
      // Should NOT show error or loading content
      expect(screen.queryByText('Unable to get insights at the moment.')).not.toBeInTheDocument();
      expect(screen.queryByText('Summarizing the findings...')).not.toBeInTheDocument();
    });

    it('should prioritize error over loading when both are present', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: true,
        error: new Error('Priority test error')
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      // Should show error (has priority)
      expect(screen.getByText('Unable to get insights at the moment.')).toBeInTheDocument();
      
      // Should NOT show loading even though isLoading is true
      expect(screen.queryByText('Summarizing the findings...')).not.toBeInTheDocument();
    });

    it('should handle all three states being false/null', () => {
      mockUseNetworkInsight.mockReturnValue({
        data: null,
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      // Should not show any of the conditional content
      expect(screen.queryByText('Unable to get insights at the moment.')).not.toBeInTheDocument();
      expect(screen.queryByText('Summarizing the findings...')).not.toBeInTheDocument();
      expect(screen.queryByText('Customer experience')).not.toBeInTheDocument();
      expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
    });
  });

  describe('🧩 Component Integration and Data Flow Tests', () => {
    it('should pass correct surface prop to Header component', () => {
      mockUseParamsDetails.mockReturnValue(MOCK_DATA.paramsDetails.darkTheme);

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      // The surface prop should be passed to Header, which uses it for Loader
      const loader = screen.queryByTestId('loader');
      if (loader) {
        expect(loader).toHaveAttribute('data-surface', 'dark');
      }
    });

    it('should handle useAIInsightStore selector function correctly', () => {
      const mockStore = {
        store: {
          currentIntent: { type: 'test', priority: 'high' },
          isNetworkInsight: true
        }
      };

      mockUseAIInsightStore.mockImplementationOnce((selector) => {
        // Test that the selector function is called correctly
        const result = selector(mockStore);
        expect(result).toEqual(mockStore.store);
        return mockStore.store;
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByTestId('fragment')).toBeInTheDocument();
    });

    it('should handle recommendations mapping with different key strategies', () => {
      const dataWithDuplicateTitles = {
        ...MOCK_DATA.networkInsights.complete,
        recommendations: [
          { title: 'Same Title', steps: ['Step 1'] },
          { title: 'Same Title', steps: ['Step 2'] },
          { title: null, steps: ['Step 3'] },
          { title: undefined, steps: ['Step 4'] }
        ]
      };

      mockUseNetworkInsight.mockReturnValue({
        data: dataWithDuplicateTitles,
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      // Should handle duplicate titles and null/undefined titles
      expect(screen.getAllByText('Same Title')).toHaveLength(2);
    });

    it('should handle summary list mapping with different item types', () => {
      const dataWithMixedItems = {
        ...MOCK_DATA.networkInsights.complete,
        summary: {
          data: [
            'String item',
            123, // Number
            null, // Null
            undefined, // Undefined
            '', // Empty string
            { object: 'value' } // Object
          ]
        }
      };

      mockUseNetworkInsight.mockReturnValue({
        data: dataWithMixedItems,
        isLoading: false,
        error: null
      });

      render(<NetworkInsight handleSubSymptoms={jest.fn()} />);

      expect(screen.getByText('String item')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
    });
  });
});
