export const wait = async (ms: number): Promise<void> => await new Promise((resolve: () => void) => setTimeout(resolve, ms))
