import React from 'react'
import { ColorTokens } from '@vds-tokens/color'
import { Body } from '@vds/typography'
import { Box, HStack, Stack } from '../../ResponsiveLayout'
import IdeasSolutions from '@vds/icons/ideas-solutions'
import Feedback from '../Feedback'
import { useNetworkInsight } from './network-insight'
import { Skeleton } from '../../Skeleton'
import { Accordion, AccordionHeader, AccordionItem, AccordionTitle, AccordionDetail } from '@vds/accordions'
import './network-insight.css'

const backgroundColor = ColorTokens.palette.blue82.value

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
)

const Header = () => (
  <HStack justifyContent="space-between" alignItems="center" width="100%">
    <Body size="large" bold>
      Network Insights Summary
    </Body>
  </HStack>
)

const Summary = ({ list = [] }) => {
  return (
    <Stack gap="4px">
      <Body size="large" bold>
        Customer experience
      </Body>
      {list?.map((item, index) => (
        <Body key={index} size="large">
          {item}
        </Body>
      ))}
    </Stack>
  )
}

const ItemList = ({ item }) => {
  if (item?.steps?.length === 0) return null
  if (item?.steps?.length === 1) {
    return <Body size="large">{item?.steps?.[0]}</Body>
  }
  return (
    <ol style={{ margin: 0 }}>
      {item?.steps?.map((step) => (
        <li key={step}>
          <Body primitive="span" size="large">
            {step}
          </Body>
        </li>
      ))}
    </ol>
  )
}

const RecommendationItem = ({ item }) => {
  return (
    <Accordion topLine={false} bottomLine={false} id="recommendation-accordion">
      <AccordionItem type='single'>
        <AccordionHeader trigger={{ type: 'icon' }}>
          <AccordionTitle >{item?.title}</AccordionTitle>
        </AccordionHeader>
        <AccordionDetail>
          <Stack gap="16px">
            <ItemList item={item} />
            <Feedback label="Was this helpful?" silent />
          </Stack>
        </AccordionDetail>
      </AccordionItem>
    </Accordion>
  )
}
const Recommendations = ({ recommendations }) => {
  return (
    <Stack gap="10px" width="70%">
      <Body bold size="large">
        Recommendations
      </Body>

      <Box marginLeft="16px">
        {recommendations?.map((item) => (
          <RecommendationItem key={item?.title} item={item} />
        ))}
      </Box>
    </Stack>
  )
}

const IconContainer = () => {
  return (
    <Box marginTop="32px">
      <IdeasSolutions iconsOnly />
    </Box>
  )
}

const FeedbackContainer = ({isDisabled}) => {
  return (
    <Box position="absolute" top="0" right="0" marginRight="50px" marginTop="25px" zIndex={1}>
      <Feedback iconsOnly silent isDisabled={isDisabled} />
    </Box>
  )
}

const NetworkInsight = () => {
  const { data: networkInsight, isLoading, error } = useNetworkInsight()

  if(error) return null

  return (
    <Box
      aria-label="Gen AI Summary"
      gap="16px"
      backgroundColor={backgroundColor}
      borderRadius="4px"
      paddingInline="16px"
      width="800px"
      position="relative"
    >
        
        <HStack gap="16px">
          <IconContainer />
          <FeedbackContainer isDisabled={isLoading}/>
          <Accordion topLine={false} bottomLine={false} >
            <AccordionItem type='single' alwaysOpen={isLoading}>
              <AccordionHeader trigger={{ type: 'icon' }}>
                <Header />
              </AccordionHeader>
              <AccordionDetail>
                {isLoading ? (<LoadingSkeleton />) : (
                  <Stack flexGrow={1} marginTop="-14px" gap="16px">
                    <Summary list={networkInsight?.summary?.data} />
                    <Recommendations recommendations={networkInsight?.recommendations} />
                  </Stack>
                )}
              </AccordionDetail>
            </AccordionItem>
          </Accordion>
        </HStack>
    </Box>
  )
}

export default NetworkInsight
