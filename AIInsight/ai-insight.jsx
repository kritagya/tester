import React, { useEffect } from 'react';
import { Body } from '@vds/typography';
import { Box, HStack, Stack } from '../../ResponsiveLayout';
import IdeasSolutions from '@vds/icons/ideas-solutions';
import Feedback from '../Feedback';
import { useAIInsight } from './ai-insight-hooks';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionTitle,
  AccordionDetail,
} from '@vds/accordions';
import {
  StyledRecommendationAccordion,
  StyledAIInsightContainer,
} from './ai-insight-styles';
import { useParamsDetails } from '../helpers/useParamDetails';
import { Button, TextLink } from '@vds/buttons';
import { useAIInsightStore } from './ai-insight-store';
import { Loader } from '@vds/loaders';
import styled from 'styled-components';

const backgroundColor = '#E3F2FD';

const AIInsightFeedback = ({ id, ...props }) => {
  const { data: aiInsight } = useAIInsight({ id });
  const { acssCallId } = useParamsDetails();

  return (
    <Feedback
      isACSS
      acssCallId={acssCallId}
      vegasTransactionId={aiInsight?.transactionId}
      {...props}
    />
  );
};

const AiLoader = styled.div`
  margin-top: 7px;
  margin-left: 20px;
  min-width: 24px;
  position: relative;
  z-index: 1;
  & div {
    background-color: unset;
    & div {
      width: 24px;
      height: 24px;
    }
  }
`

const LoadingSkeleton = ({ isDark }) => (
  <Stack gap="24px" width="100%" marginTop="12px">
    <Body size="large" color={isDark ? '#FFFFFF' : '#000000'}>
      Summarizing the findings...
    </Body>
  </Stack>
)

const Header = ({ isDark, isNetworkInsight, surface, isLoading }) => {
  return (
    <HStack alignItems="center" width="100%">
      <Body size="large" bold color={isDark ? '#FFFFFF' : '#000000'}>
        {isNetworkInsight ? 'Network' : 'Device'} Insights Summary
      </Body>
      {isLoading && (
        <AiLoader>
          <Loader fullscreen={false} active={true} surface={surface} />
        </AiLoader>
      )}
    </HStack>
  )
}

export const Summary = ({ list = [] }) => {
  const { theme } = useParamsDetails();

  return (
    <Stack gap="4px">
      <Body size="large" bold color={theme?.isDark ? '#FFFFFF' : '#000000'}>
        Customer experience
      </Body>
      <ul>
        {list?.map((item, index) => (
          <li key={index}>
          <Body
            size="large"
            color={theme?.isDark ? '#FFFFFF' : '#000000'}
          >
            {item}
          </Body>
          </li>
        ))}
      </ul>
    </Stack>
  );
};

export const ItemList = ({ item, isDark }) => {
  if (item?.steps?.length === 0) return null;
  return (
    <ol style={{ margin: 0 }}>
      {item?.steps?.map(step => (
        <li key={step}>
          <Body
            primitive="span"
            size="large"
            color={isDark ? '#FFFFFF' : '#000000'}
          >
            {step}
          </Body>
        </li>
      ))}
    </ol>
  );
};

export const LinkToArticle = ({ label, url }) => {
  const { theme } = useParamsDetails();

  if (!!!url) return null;

  return (
    <Box marginLeft="auto">
      <TextLink
        href={url}
        style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}
        surface={theme?.surface}
        target="_blank"
      >
        {label}
      </TextLink>
    </Box>
  );
};

export const RecommendationItem = ({ id, item }) => {
  const { theme } = useParamsDetails();
  return (
    <StyledRecommendationAccordion>
      <Accordion
        topLine={false}
        bottomLine={false}
        type="single"
        surface={theme.isDark ? 'dark' : "light"}
      >
        <AccordionItem>
          <AccordionHeader trigger={{ type: 'icon' }}>
            <Body size="large" bold color={theme?.isDark ? '#FFFFFF' : '#000000'}>{item?.title}</Body>
          </AccordionHeader>
          <AccordionDetail>
            <Stack gap="16px">
              <ItemList item={item} isDark={theme?.isDark} />
              <LinkToArticle label="Learn more" url={item?.link} />
              <AIInsightFeedback
                id={id}
                label="Was this helpful?"
                silent
                recommendation={item?.title}
              />
            </Stack>
          </AccordionDetail>
        </AccordionItem>
      </Accordion>
    </StyledRecommendationAccordion>
  );
};

export const Recommendations = ({ recommendations, id }) => {
  const { theme } = useParamsDetails();

  if (!recommendations || recommendations?.length === 0) return null;

  return (
    <Stack gap="10px" width="70%">
      <Body bold size="large" color={theme?.isDark ? '#FFFFFF' : '#000000'}>
        Recommendations
      </Body>

      <Box>
        {recommendations?.map(item => (
          <RecommendationItem key={item?.title} id={id} item={item} />
        ))}
      </Box>
    </Stack>
  );
};

export const IconContainer = () => {
  const { theme } = useParamsDetails();
  return (
    <Box marginTop="15px">
      <IdeasSolutions iconsOnly surface={theme?.surface} />
    </Box>
  );
};

export const FeedbackContainer = ({ isDisabled, id }) => {
  return (
    <Box
      position="absolute"
      top="0"
      right="0"
      marginRight="50px"
      marginTop="10px"
      zIndex={1}
    >
      <AIInsightFeedback id={id} iconsOnly silent isDisabled={isDisabled} />
    </Box>
  );
};

export const ErrorMessage = () => {
  const { theme } = useParamsDetails();

  return (
    <Body size="large" color={theme?.isDark ? '#FFFFFF' : '#000000'}>
      Unable to get insights at the moment.
    </Body>
  );
};

export const ContinueTroubleshooting = ({ handleSubSymptoms, isDark, isLoading }) => {
  const currentIntent = useAIInsightStore(state => state.store.currentIntent);
  const newAiIntent = { ...currentIntent, fromAiContinue: true };
  console.log({ newAiIntent });

  const handleContinue = () => {
    handleSubSymptoms(newAiIntent, null);
  };

  // if isLoading more then 1 min, trigger handleContinue
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        handleContinue();
      }
    }, 60000);

    return () => clearTimeout(timer);
  }, [isLoading, handleContinue]);

  return (
    <HStack
      gap="16px"
      justifyContent="flex-end"
      padding="0px 0px 24px 0px"
      marginRight="20px"
    >
      <Button
        size="small"
        surface={isDark ? 'dark' : 'light'}
        use="primary"
        onClick={handleContinue}
      >
        Continue Troubleshooting
      </Button>
    </HStack>
  );
};
const AIInsight = ({ id, handleSubSymptoms }) => {
  const { theme } = useParamsDetails();
  const { data: aiInsight, isLoading, error } = useAIInsight({ id });
  const aiInsightStore = useAIInsightStore(s => s.store);

  // if (error) return null;

  return (
    <Box
      aria-label="Gen AI network insight"
      gap="16px"
      backgroundColor={theme?.isDark ? '#000' : backgroundColor}
      borderRadius="4px"
      paddingInline="16px"
      width="100%"
      position="relative"
    >
      <StyledAIInsightContainer>
        <HStack gap="16px" id="ai-insight">
          <IconContainer />
          <FeedbackContainer
            key={aiInsightStore?.intentId}
            id={id}
            isDisabled={isLoading}
          />
            <Stack marginTop="-14px" width="100%">
              <Accordion
                topLine={false}
                bottomLine={false}
                surface={theme?.isDark ? 'dark' : 'light'}
              >
                <AccordionItem type="single" alwaysOpen={isLoading} opened>
                  <AccordionHeader trigger={{ type: 'icon' }}>
                    <Header surface={theme?.surface} isDark={theme?.isDark} isNetworkInsight={aiInsightStore?.isNetworkInsight} isLoading={isLoading} />
                  </AccordionHeader>
                  <AccordionDetail>
                    {error && <ErrorMessage />}
                      {!error && isLoading && <LoadingSkeleton isDark={theme?.isDark} />}
                    {!error && !isLoading && (
                      <Stack flexGrow={1} marginTop="-14px" gap="16px">
                        <Summary list={aiInsight?.summary?.data} />
                        <Recommendations
                          recommendations={aiInsight?.recommendations}
                          id={id}
                        />
                      </Stack>
                    )}
                  </AccordionDetail>
                </AccordionItem>
              </Accordion>
          </Stack>
        </HStack>
      </StyledAIInsightContainer>
      <ContinueTroubleshooting
        handleSubSymptoms={handleSubSymptoms}
        isDark={theme?.isDark}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default AIInsight;
