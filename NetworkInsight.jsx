import React from 'react';
import { Body } from '@vds/typography';
import { Box, HStack, Stack } from '../../ResponsiveLayout';
import IdeasSolutions from '@vds/icons/ideas-solutions';
import Feedback from '../Feedback';
import { useNetworkInsight } from './ai-insight-hooks';
import { Skeleton } from '../../Skeleton';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionTitle,
  AccordionDetail,
} from '@vds/accordions';
import {
  StyledRecommendationAccordion,
  StyledNetworkInsightContainer,
} from './ai-insight-styles';
import { useParamsDetails } from '../helpers/useParamDetails';
import { Button, TextLink } from '@vds/buttons';
import { useAIInsightStore } from './ai-insight-store';
import styled from 'styled-components';


const backgroundColor = '#E3F2FD';

const ContinueWrapper = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding: 0px 0px 24px 0px;
  margin-right: 20px;
`;


const NetworkInsightFeedback = ({ ...props }) => {
  const { data: networkInsight } = useNetworkInsight();
  const { acssCallId } = useParamsDetails();

  return (
    <Feedback
      isACSS
      acssCallId={acssCallId}
      vegasTransactionId={networkInsight?.transactionId}
      {...props}
    />
  );
};

const LoadingSkeleton = () => (
  <Stack gap="24px" width="100%" marginTop="12px">
    <Stack>
      <Stack gap="8px" width="100%">
        <Skeleton width="95%" height="1.2rem" />
        <Skeleton width="98%" height="1.2rem" />
        <Skeleton width="90%" height="1.2rem" />
      </Stack>
    </Stack>
  </Stack>
);

const Header = ({ isDark, isNetworkInsight }) => {
  return (
    <HStack justifyContent="space-between" alignItems="center" width="100%">
      <Body size="large" bold color={isDark ? '#FFFFFF' : '#000000'}>
        {isNetworkInsight ? 'Network' : 'Device'} Insights Summary
      </Body>
    </HStack>
  );
};

const Summary = ({ list = [] }) => {
  const { theme } = useParamsDetails();

  return (
    <Stack gap="4px">
      <Body size="large" bold color={theme?.isDark ? '#FFFFFF' : '#000000'}>
        Customer experience
      </Body>
      {list?.map((item, index) => (
        <Body
          key={index}
          size="large"
          color={theme?.isDark ? '#FFFFFF' : '#000000'}
        >
          {item}
        </Body>
      ))}
    </Stack>
  );
};

const ItemList = ({ item, isDark }) => {
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

const LinkToArticle = ({ label, url }) => {
  const { theme } = useParamsDetails();

  if (!!!url) return null;

  return (
    <Box marginLeft="auto">
      <TextLink
        href={url}
        style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}
        surface={theme?.surface}
      >
        {label}
      </TextLink>
    </Box>
  );
};

const RecommendationItem = ({ item }) => {
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
            <AccordionTitle>{item?.title}</AccordionTitle>
          </AccordionHeader>
          <AccordionDetail>
            <Stack gap="16px">
              <ItemList item={item} isDark={theme?.isDark} />
              <LinkToArticle label="Learn more" url={item?.link} />
              <NetworkInsightFeedback
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
const Recommendations = ({ recommendations }) => {
  const { theme } = useParamsDetails();
  return (
    <Stack gap="10px" width="70%">
      <Body bold size="large" color={theme?.isDark ? '#FFFFFF' : '#000000'}>
        Recommendations
      </Body>

      <Box marginLeft="16px">
        {recommendations?.map(item => (
          <RecommendationItem key={item?.title} item={item} />
        ))}
      </Box>
    </Stack>
  );
};

const IconContainer = () => {
  const { theme } = useParamsDetails();
  return (
    <Box marginTop="32px">
      <IdeasSolutions iconsOnly surface={theme?.surface} />
    </Box>
  );
};

const FeedbackContainer = ({ isDisabled }) => {
  return (
    <Box
      position="absolute"
      top="0"
      right="0"
      marginRight="50px"
      marginTop="25px"
      zIndex={1}
    >
      <NetworkInsightFeedback iconsOnly silent isDisabled={isDisabled} />
    </Box>
  );
};

const ErrorMessage = () => {
  const { theme } = useParamsDetails();

  return (
    <Body size="large" color={theme?.isDark ? '#FFFFFF' : '#000000'}>
      Unable to get insights at the moment.
    </Body>
  );
};

const Continue = ({ handleSubSymptoms }) => {
  const currentIntent = useAIInsightStore(state => state.store.currentIntent);
  const newAiIntent = { ...currentIntent, fromAiContinue: true };
  console.log({ newAiIntent });
  const handleContinue = async () => {
    await handleSubSymptoms(newAiIntent, null);
  };

  return (
    <ContinueWrapper>
      <Button size="small"  use="secondary" onClick={handleContinue}>
        Continue Troubleshooting
      </Button>
    </ContinueWrapper>
  );
};

const NetworkInsight = ({ handleSubSymptoms }) => {
  const { theme } = useParamsDetails();
  const { data: networkInsight, isLoading, error } = useNetworkInsight();
  const aiInsightStore = useAIInsightStore(s => s.store);
  console.log({ theme });

  // if (error) return null;

  return (
    <>
    <Box
      aria-label="Gen AI network insight"
      gap="16px"
      backgroundColor={theme?.isDark ? '#000' : backgroundColor}
      borderRadius="4px"
      paddingInline="16px"
      width="100%"
      position="relative"
    >
      <StyledNetworkInsightContainer>
        <HStack gap="16px" id="network-insight">
          <IconContainer />
          <FeedbackContainer
            key={aiInsightStore?.intentId}
            isDisabled={isLoading}
          />
          <Stack marginTop="25px" width="100%">
            <Accordion
              topLine={false}
              bottomLine={false}
              surface={theme?.isDark ? 'dark' : 'light'}
            >
              <AccordionItem type="single" alwaysOpen={isLoading} opened>
                <AccordionHeader trigger={{ type: 'icon' }}>
                  <Header
                    isDark={theme?.isDark}
                    isNetworkInsight={aiInsightStore?.isNetworkInsight}
                  />
                </AccordionHeader>
                <AccordionDetail>
                  {error && <ErrorMessage />}
                  {!error && isLoading && <LoadingSkeleton />}
                  {!error && !isLoading && (
                    <Stack flexGrow={1} marginTop="-14px" gap="16px">
                      <Summary list={networkInsight?.summary?.data} />
                      <Recommendations
                        recommendations={networkInsight?.recommendations}
                      />
                    </Stack>
                  )}
                </AccordionDetail>
              </AccordionItem>
            </Accordion>
          </Stack>
        </HStack>
        
      </StyledNetworkInsightContainer>
      <Continue handleSubSymptoms={handleSubSymptoms} />
    </Box> 
    
    </>
  );
};

export default NetworkInsight;
