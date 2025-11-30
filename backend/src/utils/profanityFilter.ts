// Profanity filter utility for backend
const INAPPROPRIATE_WORDS = [
  // Sexual content
  'sex', 'sexy', 'porn', 'xxx', 'adult', 'nude', 'naked', 'sexual',
  'erotic', 'intimate', 'sensual', 'aroused', 'horny', 'kinky',
  'fetish', 'orgasm', 'masturbate', 'ejaculate', 'climax',
  'penis', 'vagina', 'pussy', 'tits', 'boobs', 'breasts', 'nipples', 
  'anal', 'oral', 'blowjob', 'handjob', 'dildo', 'vibrator',
  'lesbian', 'gay', 'bisexual', 'transgender', 'threesome',
  'milf', 'slut', 'whore', 'prostitute', 'escort', 'brothel',
  
  // Strong profanity
  'fuck', 'fucking', 'fucker', 'fucked', 'motherfucker',
  'shit', 'shitting', 'bullshit', 'horseshit', 'dipshit',
  'damn', 'damned', 'goddamn', 'hell', 'hellish',
  'ass', 'asshole', 'arse', 'arsehole', 'jackass', 'dumbass',
  'bitch', 'bitching', 'son of a bitch', 'bastard',
  'crap', 'crappy', 'piss', 'pissed', 'pissing',
  
  // Anatomical terms (inappropriate context)
  'cock', 'dick', 'dickhead', 'prick', 'balls', 'ballsack',
  'scrotum', 'testicles', 'labia', 'clitoris', 'vulva',
  'anus', 'rectum', 'butthole', 'butt', 'booty',
  
  // Derogatory terms
  'retard', 'retarded', 'moron', 'idiot', 'stupid',
  'dumb', 'loser', 'freak', 'weirdo', 'creep',
  'pervert', 'perv', 'sicko', 'psycho', 'crazy',
  
  // Racial/ethnic slurs (abbreviated to avoid offense)
  'n*gger', 'n*gga', 'sp*c', 'ch*nk', 'g*ok',
  'k*ke', 'w*p', 'cr*cker', 'h*nky', 'w*tback',
  
  // Drug-related
  'marijuana', 'weed', 'pot', 'cannabis', 'cocaine',
  'crack', 'heroin', 'meth', 'ecstasy', 'lsd',
  'drug', 'drugs', 'dealer', 'addict', 'junkie',
  
  // Violence/threats
  'kill', 'murder', 'suicide', 'rape', 'assault',
  'violence', 'violent', 'shoot', 'shooting', 'bomb',
  'terrorist', 'terrorism', 'threat', 'threatening',
  
  // Spam/inappropriate
  'casino', 'gambling', 'poker', 'lottery', 'viagra',
  'cialis', 'pharmacy', 'prescription', 'loan', 'mortgage',
  'insurance', 'credit', 'debt', 'money', 'cash',
  'investment', 'profit', 'earn', 'income', 'business'
]

// Whitelist of acceptable contexts for some words
const WHITELIST_CONTEXTS = [
  // Allow travel-related uses
  'business trip', 'business travel', 'business class',
  'cash payment', 'cash only', 'investment property',
  'casino hotel', 'casino resort', 'prescription medicine',
  // Allow proper medical/educational contexts
  'kill time', 'kill switch', 'shoot photos', 'shoot video'
]

export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase()
  
  // Check if text contains whitelisted contexts
  const hasWhitelistedContext = WHITELIST_CONTEXTS.some(context => 
    lowerText.includes(context.toLowerCase())
  )
  
  if (hasWhitelistedContext) {
    return false
  }
  
  // Filter out some words that might have false positives in travel context
  const travelSafeWords = ['business', 'cash', 'investment', 'casino', 'prescription']
  
  return INAPPROPRIATE_WORDS.some(word => {
    // Skip certain words if they might be in travel context
    if (travelSafeWords.includes(word) && (
      lowerText.includes('travel') || 
      lowerText.includes('trip') || 
      lowerText.includes('hotel') ||
      lowerText.includes('resort') ||
      lowerText.includes('medicine') ||
      lowerText.includes('medical')
    )) {
      return false
    }
    
    // Check for exact word matches with word boundaries
    const regex = new RegExp(`\\b${word.replace(/\*/g, '.')}\\b`, 'i')
    return regex.test(lowerText)
  })
}

export function filterProfanity(text: string): string {
  let filteredText = text
  INAPPROPRIATE_WORDS.forEach(word => {
    // Handle asterisked words by replacing * with . for regex
    const regexWord = word.replace(/\*/g, '.')
    const regex = new RegExp(`\\b${regexWord}\\b`, 'gi')
    filteredText = filteredText.replace(regex, '*'.repeat(word.replace(/\*/g, '').length))
  })
  return filteredText
}

export function getProfanityError(): string {
  return 'Comment contains inappropriate content. Please revise your message.'
}
