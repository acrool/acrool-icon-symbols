export const regRules = {
    svg: /<svg\b[^>]*?(?:viewBox=\"(\b[^"]*)\")?>([\s\S]*?)<\/svg>/g,
    symbol: /<symbol\b[^>]*?(?:viewBox=\"(\b[^"]*)\")?>([\s\S]*?)<\/symbol>/g,
    symbolPath: /<symbol\b[^>]*?(?:viewBox=\"(\b[^"]*)\")?>([\s\S]*?)<\/symbol>/,
    id: /id=\"(.*?)\"/g,
}