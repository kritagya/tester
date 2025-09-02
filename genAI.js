export const isGenAIEnabled = (values) => {
  return values?.troubleShootingInfo?.ddata?.output?.pageContent?.steps?.[0]?.aiSummryEnabled
}
