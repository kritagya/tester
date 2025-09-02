import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NetworkInsight from './NetworkInsight';

// Mock all external dependencies
jest.mock('@vds-tokens/color', () => ({
  ColorTokens: {
    palette: {
      blue82: {
        value: '#e6f3ff'
      }
    }
  }
}));

jest.mock('@vds/typography', () => ({
  Body: ({ children, size, bold, primitive = 'div', ...props }) => {
    const Component = primitive;
    return (
      <Component 
        data-testid="body" 
        data-size={size} 
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
  return function IdeasSolutions({ iconsOnly }) {
    return <div data-testid="ideas-solutions" data-icons-only={iconsOnly} />;
  };
});

jest.mock('../Feedback', () => {
  return function Feedback({ label, silent, iconsOnly, isDisabled }) {
    return (
      <div 
        data-testid="feedback" 
        data-label={label}
        data-silent={silent}
        data-icons-only={iconsOnly}
        data-disabled={isDisabled}
      />
    );
  };
});

jest.mock('../../Skeleton', () => ({
  Skeleton: ({ width, height }) => (
    <div data-testid="skeleton" data-width={width} data-height={height} />
  )
}));

jest.mock('@vds/accordions', () => ({
  Accordion: ({ children, topLine, bottomLine, id }) => (
    <div 
      data-testid="accordion" 
      data-top-line={topLine}
      data-bottom-line={bottomLine}
      id={id}
    >
      {children}
    </div>
  ),
  AccordionItem: ({ children, type, alwaysOpen }) => (
    <div 
      data-testid="accordion-item" 
      data-type={type}
      data-always-open={alwaysOpen}
    >
      {children}
    </div>
  ),
  AccordionHeader: ({ children, trigger }) => (
    <div data-testid="accordion-header" data-trigger-type={trigger?.type}>
      {children}
    </div>
  ),
  AccordionTitle: ({ children }) => (
    <div data-testid="accordion-title">{children}</div>
  ),
  AccordionDetail: ({ children }) => (
    <div data-testid="accordion-detail">{children}</div>
  )
}));

jest.mock('./network-insight', () => ({
  useNetworkInsight: jest.fn()
}));

jest.mock('./network-insight.css', () => ({}));

const { useNetworkInsight } = require('./network-insight');

describe('NetworkInsight.jsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LoadingSkeleton Component', () => {
    it('should render loading skeleton with correct structure', () => {
      useNetworkInsight.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      render(<NetworkInsight />);

      const skeletons = screen.getAllByTestId('skeleton');
      expect(skeletons).toHaveLength(3);
      expect(skeletons[0]).toHaveAttribute('data-width', '95%');
      expect(skeletons[0]).toHaveAttribute('data-height', '1.2rem');
      expect(skeletons[1]).toHaveAttribute('data-width', '98%');
      expect(skeletons[2]).toHaveAttribute('data-width', '90%');
    });
  });

  describe('Header Component', () => {
    it('should render header with correct text and styling', () => {
      useNetworkInsight.mockReturnValue({
        data: { summary: { data: [] }, recommendations: [] },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      const headerText = screen.getByText('Network Insights Summary');
      expect(headerText).toBeInTheDocument();
      expect(headerText).toHaveAttribute('data-size', 'large');
      expect(headerText).toHaveAttribute('data-bold', 'true');
    });
  });

  describe('Summary Component', () => {
    it('should render summary with customer experience header', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: ['Issue 1', 'Issue 2'] }, 
          recommendations: [] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      expect(screen.getByText('Customer experience')).toBeInTheDocument();
      expect(screen.getByText('Issue 1')).toBeInTheDocument();
      expect(screen.getByText('Issue 2')).toBeInTheDocument();
    });

    it('should render summary with empty list', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: [] }, 
          recommendations: [] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      expect(screen.getByText('Customer experience')).toBeInTheDocument();
      expect(screen.queryByText('Issue 1')).not.toBeInTheDocument();
    });

    it('should handle undefined list prop', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: undefined }, 
          recommendations: [] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      expect(screen.getByText('Customer experience')).toBeInTheDocument();
    });

    it('should render summary items with correct keys', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: ['First item', 'Second item', 'Third item'] }, 
          recommendations: [] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      const summaryItems = screen.getAllByTestId('body').filter(item => 
        item.textContent === 'First item' || 
        item.textContent === 'Second item' || 
        item.textContent === 'Third item'
      );
      expect(summaryItems).toHaveLength(3);
    });
  });

  describe('ItemList Component', () => {
    it('should return null when steps array is empty', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: [] }, 
          recommendations: [{ title: 'Test', steps: [] }] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      // Should not render any list items
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('should render single step without list when steps length is 1', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: [] }, 
          recommendations: [{ title: 'Test', steps: ['Single step'] }] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      expect(screen.getByText('Single step')).toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('should render ordered list when steps length is greater than 1', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: [] }, 
          recommendations: [{ 
            title: 'Test', 
            steps: ['Step 1', 'Step 2', 'Step 3'] 
          }] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Step 3')).toBeInTheDocument();

      // Check for ordered list
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });

    it('should render Body components with correct props for list items', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: [] }, 
          recommendations: [{ 
            title: 'Test', 
            steps: ['Step 1', 'Step 2'] 
          }] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      const step1Element = screen.getByText('Step 1');
      const step2Element = screen.getByText('Step 2');
      
      expect(step1Element).toHaveAttribute('data-size', 'large');
      expect(step2Element).toHaveAttribute('data-size', 'large');
    });

    it('should handle undefined steps', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: [] }, 
          recommendations: [{ title: 'Test', steps: undefined }] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      // Should not crash and not render any steps
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('should handle null item', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: [] }, 
          recommendations: [null] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      // Should not crash
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
    });
  });

  describe('RecommendationItem Component', () => {
    it('should render recommendation item with accordion structure', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: [] }, 
          recommendations: [{ title: 'Fix Network Issue', steps: ['Step 1'] }] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      expect(screen.getByText('Fix Network Issue')).toBeInTheDocument();
      expect(screen.getByTestId('accordion')).toHaveAttribute('id', 'recommendation-accordion');
      expect(screen.getByTestId('accordion')).toHaveAttribute('data-top-line', 'false');
      expect(screen.getByTestId('accordion')).toHaveAttribute('data-bottom-line', 'false');
    });

    it('should render feedback component with correct props', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: [] }, 
          recommendations: [{ title: 'Fix Network Issue', steps: ['Step 1'] }] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      const feedback = screen.getAllByTestId('feedback').find(f => 
        f.getAttribute('data-label') === 'Was this helpful?'
      );
      expect(feedback).toBeInTheDocument();
      expect(feedback).toHaveAttribute('data-label', 'Was this helpful?');
      expect(feedback).toHaveAttribute('data-silent', 'true');
    });

    it('should handle undefined item', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: [] }, 
          recommendations: [undefined] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      // Should not crash
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
    });
  });

  describe('Recommendations Component', () => {
    it('should render recommendations header', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: [] }, 
          recommendations: [] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      const recommendationsHeader = screen.getByText('Recommendations');
      expect(recommendationsHeader).toBeInTheDocument();
      expect(recommendationsHeader).toHaveAttribute('data-bold', 'true');
      expect(recommendationsHeader).toHaveAttribute('data-size', 'large');
    });

    it('should render multiple recommendation items', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: [] }, 
          recommendations: [
            { title: 'Fix Issue 1', steps: ['Step 1'] },
            { title: 'Fix Issue 2', steps: ['Step 2'] }
          ] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      expect(screen.getByText('Fix Issue 1')).toBeInTheDocument();
      expect(screen.getByText('Fix Issue 2')).toBeInTheDocument();
    });

    it('should handle empty recommendations array', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: [] }, 
          recommendations: [] 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      expect(screen.getByText('Recommendations')).toBeInTheDocument();
      // No recommendation items should be rendered
      expect(screen.queryByText('Fix Issue 1')).not.toBeInTheDocument();
    });

    it('should handle undefined recommendations', () => {
      useNetworkInsight.mockReturnValue({
        data: { 
          summary: { data: [] }, 
          recommendations: undefined 
        },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      expect(screen.getByText('Recommendations')).toBeInTheDocument();
    });
  });

  describe('IconContainer Component', () => {
    it('should render IdeasSolutions icon with correct props', () => {
      useNetworkInsight.mockReturnValue({
        data: { summary: { data: [] }, recommendations: [] },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      const icon = screen.getByTestId('ideas-solutions');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('data-icons-only', 'true');
    });
  });

  describe('FeedbackContainer Component', () => {
    it('should render feedback with isDisabled=true when loading', () => {
      useNetworkInsight.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      render(<NetworkInsight />);

      const feedback = screen.getAllByTestId('feedback').find(f => 
        f.getAttribute('data-icons-only') === 'true'
      );
      expect(feedback).toBeInTheDocument();
      expect(feedback).toHaveAttribute('data-disabled', 'true');
      expect(feedback).toHaveAttribute('data-icons-only', 'true');
      expect(feedback).toHaveAttribute('data-silent', 'true');
    });

    it('should render feedback with isDisabled=false when not loading', () => {
      useNetworkInsight.mockReturnValue({
        data: { summary: { data: [] }, recommendations: [] },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      const feedback = screen.getAllByTestId('feedback').find(f => 
        f.getAttribute('data-icons-only') === 'true'
      );
      expect(feedback).toBeInTheDocument();
      expect(feedback).toHaveAttribute('data-disabled', 'false');
    });
  });

  describe('NetworkInsight Main Component', () => {
    it('should return null when there is an error', () => {
      useNetworkInsight.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network error')
      });

      const { container } = render(<NetworkInsight />);
      expect(container.firstChild).toBeNull();
    });

    it('should render loading state correctly', () => {
      useNetworkInsight.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      render(<NetworkInsight />);

      // Check that loading skeleton is rendered
      expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
      
      // Check that accordion is set to alwaysOpen when loading
      const accordionItem = screen.getByTestId('accordion-item');
      expect(accordionItem).toHaveAttribute('data-always-open', 'true');

      // Check that feedback is disabled
      const feedback = screen.getAllByTestId('feedback').find(f => 
        f.getAttribute('data-icons-only') === 'true'
      );
      expect(feedback).toHaveAttribute('data-disabled', 'true');
    });

    it('should render data state correctly', () => {
      const mockData = {
        summary: { data: ['Network issue detected', 'Signal strength low'] },
        recommendations: [
          { title: 'Reset Network Settings', steps: ['Go to Settings', 'Reset Network'] },
          { title: 'Check Coverage', steps: ['Move to different location'] }
        ]
      };

      useNetworkInsight.mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      // Check that data is rendered
      expect(screen.getByText('Network issue detected')).toBeInTheDocument();
      expect(screen.getByText('Signal strength low')).toBeInTheDocument();
      expect(screen.getByText('Reset Network Settings')).toBeInTheDocument();
      expect(screen.getByText('Check Coverage')).toBeInTheDocument();

      // Check that accordion is not set to alwaysOpen
      const accordionItem = screen.getByTestId('accordion-item');
      expect(accordionItem).toHaveAttribute('data-always-open', 'false');

      // Check that feedback is not disabled
      const feedback = screen.getAllByTestId('feedback').find(f => 
        f.getAttribute('data-icons-only') === 'true'
      );
      expect(feedback).toHaveAttribute('data-disabled', 'false');
    });

    it('should render with correct Box styling and attributes', () => {
      useNetworkInsight.mockReturnValue({
        data: { summary: { data: [] }, recommendations: [] },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      const mainBox = screen.getAllByTestId('box')[0]; // Get the main container box
      expect(mainBox).toHaveAttribute('aria-label', 'Gen AI Summary');
      expect(mainBox).toHaveAttribute('gap', '16px');
      expect(mainBox).toHaveAttribute('backgroundColor', '#e6f3ff');
      expect(mainBox).toHaveAttribute('borderRadius', '4px');
      expect(mainBox).toHaveAttribute('paddingInline', '16px');
      expect(mainBox).toHaveAttribute('width', '800px');
      expect(mainBox).toHaveAttribute('position', 'relative');
    });

    it('should render accordion with correct props', () => {
      useNetworkInsight.mockReturnValue({
        data: { summary: { data: [] }, recommendations: [] },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      const accordion = screen.getByTestId('accordion');
      expect(accordion).toHaveAttribute('data-top-line', 'false');
      expect(accordion).toHaveAttribute('data-bottom-line', 'false');

      const accordionItem = screen.getByTestId('accordion-item');
      expect(accordionItem).toHaveAttribute('data-type', 'single');

      const accordionHeader = screen.getByTestId('accordion-header');
      expect(accordionHeader).toHaveAttribute('data-trigger-type', 'icon');
    });

    it('should handle null data gracefully', () => {
      useNetworkInsight.mockReturnValue({
        data: null,
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      // Should render without crashing
      expect(screen.getByText('Network Insights Summary')).toBeInTheDocument();
      expect(screen.getByText('Customer experience')).toBeInTheDocument();
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
    });

    it('should handle data with null summary', () => {
      useNetworkInsight.mockReturnValue({
        data: { summary: null, recommendations: [] },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      expect(screen.getByText('Customer experience')).toBeInTheDocument();
    });

    it('should handle data with null recommendations', () => {
      useNetworkInsight.mockReturnValue({
        data: { summary: { data: [] }, recommendations: null },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      expect(screen.getByText('Recommendations')).toBeInTheDocument();
    });

    it('should render all structural elements', () => {
      useNetworkInsight.mockReturnValue({
        data: { summary: { data: [] }, recommendations: [] },
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      // Check all major structural elements are present
      expect(screen.getByTestId('ideas-solutions')).toBeInTheDocument();
      expect(screen.getAllByTestId('feedback')).toHaveLength(2); // One in recommendations, one in feedback container
      expect(screen.getByTestId('accordion')).toBeInTheDocument();
      expect(screen.getByTestId('accordion-item')).toBeInTheDocument();
      expect(screen.getByTestId('accordion-header')).toBeInTheDocument();
      expect(screen.getByTestId('accordion-title')).toBeInTheDocument();
      expect(screen.getByTestId('accordion-detail')).toBeInTheDocument();
    });

    it('should handle complex recommendation data structure', () => {
      const complexData = {
        summary: { 
          data: [
            'Complex network issue with multiple symptoms',
            'Performance degradation across multiple services'
          ] 
        },
        recommendations: [
          { 
            title: 'Multi-step Network Diagnosis', 
            steps: [
              'Check physical connections',
              'Verify network configuration',
              'Test connectivity to each service',
              'Monitor performance metrics'
            ] 
          },
          { 
            title: 'Single Action Fix', 
            steps: ['Restart router'] 
          },
          { 
            title: 'Empty Steps', 
            steps: [] 
          }
        ]
      };

      useNetworkInsight.mockReturnValue({
        data: complexData,
        isLoading: false,
        error: null
      });

      render(<NetworkInsight />);

      // Verify summary items
      expect(screen.getByText('Complex network issue with multiple symptoms')).toBeInTheDocument();
      expect(screen.getByText('Performance degradation across multiple services')).toBeInTheDocument();

      // Verify multi-step recommendation renders as ordered list
      expect(screen.getByText('Check physical connections')).toBeInTheDocument();
      expect(screen.getByText('Verify network configuration')).toBeInTheDocument();
      expect(screen.getByText('Test connectivity to each service')).toBeInTheDocument();
      expect(screen.getByText('Monitor performance metrics')).toBeInTheDocument();

      // Verify single step recommendation
      expect(screen.getByText('Restart router')).toBeInTheDocument();

      // Verify all recommendation titles
      expect(screen.getByText('Multi-step Network Diagnosis')).toBeInTheDocument();
      expect(screen.getByText('Single Action Fix')).toBeInTheDocument();
      expect(screen.getByText('Empty Steps')).toBeInTheDocument();
    });
  });
});
