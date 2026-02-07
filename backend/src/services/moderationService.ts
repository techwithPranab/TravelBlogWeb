/**
 * Content Moderation Service
 * Validates review content for offensive language and minimum word requirements
 */

export interface ModerationResult {
  isValid: boolean
  violations: ModerationViolation[]
  wordCount: number
  suggestions: string[]
  flaggedWords: string[]
}

export interface ModerationViolation {
  type: 'offensive_content' | 'minimum_words' | 'spam' | 'invalid_format'
  message: string
  word?: string
  position?: number
}

class ModerationService {
  // Offensive words blacklist - organized by category
  private offensiveWords: Set<string>
  private spamPatterns: RegExp[]

  constructor() {
    // Initialize offensive words list
    this.offensiveWords = new Set([
      // Sexual content
      'porn', 'sex', 'xxx', 'nude', 'naked', 'nsfw', 'adult',
      'erotic', 'sexual', 'sexy', 'seduce', 'seductive',
      
      // Profanity (common variants)
      'fuck', 'shit', 'damn', 'hell', 'bitch', 'bastard',
      'ass', 'asshole', 'crap', 'piss', 'dick', 'cock',
      'fck', 'fuk', 'sh1t', 'a$$', 'b1tch', 'dmn',
      
      // Hate speech and discriminatory language
      'hate', 'racist', 'nazi', 'supremacist', 'terrorism',
      'terrorist', 'kill', 'murder', 'rape', 'assault',
      
      // Slurs and offensive terms (partial list for demonstration)
      'retard', 'retarded', 'idiot', 'moron', 'stupid',
      'dumb', 'loser', 'trash', 'garbage', 'worthless',
      
      // Spam indicators
      'click here', 'buy now', 'limited time', 'act now',
      'congratulations', 'you won', 'claim prize', 'free money',
      'make money fast', 'work from home', 'guaranteed'
    ])

    // Spam patterns
    this.spamPatterns = [
      /\b(https?:\/\/[^\s]+)/gi, // URLs
      /\b[\w\.-]+@[\w\.-]+\.\w+/gi, // Email addresses
      /\b\d{10,}\b/gi, // Long numbers (phone numbers)
      /(.)\1{4,}/gi, // Repeated characters (e.g., 'aaaaaa')
      /\$\$\$+/gi, // Multiple dollar signs
      /!!!!!+/gi, // Excessive exclamation marks
      /\b(BUY|CLICK|FREE|WIN)\b/gi // Spam keywords in caps
    ]
  }

  /**
   * Main validation method - checks content for all violations
   */
  public async checkForOffensiveContent(text: string, minWords: number = 10): Promise<ModerationResult> {
    const violations: ModerationViolation[] = []
    const suggestions: string[] = []
    const flaggedWords: string[] = []

    // Sanitize text
    const sanitizedText = this.sanitizeText(text)
    
    // Count words
    const wordCount = this.countWords(sanitizedText)

    // Check minimum words
    if (wordCount < minWords) {
      violations.push({
        type: 'minimum_words',
        message: `Review must contain at least ${minWords} words. Current: ${wordCount} words.`
      })
      suggestions.push(`Add ${minWords - wordCount} more words to meet the minimum requirement`)
    }

    // Check for offensive words
    const offensiveCheck = this.containsOffensiveWords(sanitizedText)
    if (offensiveCheck.hasOffensive) {
      offensiveCheck.words.forEach(word => {
        violations.push({
          type: 'offensive_content',
          // Use the string itself (word.word) to avoid object-to-string coercion
          message: `Contains potentially offensive or inappropriate content: "${word.word}"`,
          word: word.word,
          position: word.position
        })
        flaggedWords.push(word.word)
      })
      suggestions.push('Please remove or rephrase offensive content')
      suggestions.push('Keep your review respectful and appropriate for all audiences')
    }

    // Check for spam patterns
    const spamCheck = this.containsSpam(sanitizedText)
    if (spamCheck.isSpam) {
      violations.push({
        type: 'spam',
        message: 'Review appears to contain spam or promotional content'
      })
      suggestions.push('Remove URLs, email addresses, or promotional content')
      suggestions.push('Focus on your genuine experience with the itinerary')
    }

    // Check for invalid formatting
    if (this.hasInvalidFormat(sanitizedText)) {
      violations.push({
        type: 'invalid_format',
        message: 'Review contains excessive repeated characters or formatting issues'
      })
      suggestions.push('Use proper capitalization and avoid excessive punctuation')
    }

    return {
      isValid: violations.length === 0,
      violations,
      wordCount,
      suggestions,
      flaggedWords
    }
  }

  /**
   * Count words in text
   */
  public countWords(text: string): number {
    const trimmed = text.trim()
    if (!trimmed) return 0
    return trimmed.split(/\s+/).length
  }

  /**
   * Validate minimum word count
   */
  public validateMinimumWords(text: string, minWords: number): boolean {
    return this.countWords(text) >= minWords
  }

  /**
   * Check for offensive words
   */
  public containsOffensiveWords(text: string): { hasOffensive: boolean; words: Array<{ word: string; position: number }> } {
    const lowerText = text.toLowerCase()
    let words: Array<{ word: string; position: number }> = []

    // Check each offensive word with word boundaries
    this.offensiveWords.forEach(offensiveWord => {
      // Create regex with word boundaries to avoid false positives
      const regex = new RegExp(`\\b${this.escapeRegex(offensiveWord)}\\b`, 'gi')
      let match

      while ((match = regex.exec(lowerText)) !== null) {
        words.push({
          word: offensiveWord,
          position: match.index
        })
      }
    })

    // Check for common obfuscation patterns (e.g., s.h.i.t, s_h_i_t, s!h!i!t)
    const obfuscationPatterns = [
      /f[\W_]*u[\W_]*c[\W_]*k/gi,
      /s[\W_]*h[\W_]*i[\W_]*t/gi,
      /a[\W_]*s[\W_]*s/gi,
      /b[\W_]*i[\W_]*t[\W_]*c[\W_]*h/gi
    ]

    obfuscationPatterns.forEach(pattern => {
      // Reset lastIndex in case regex is reused
      pattern.lastIndex = 0
      let match
      while ((match = pattern.exec(lowerText)) !== null) {
        const start = match.index
        const end = start + match[0].length
        const charBefore = lowerText[start - 1]
        const charAfter = lowerText[end]

        // Ensure match is not part of a larger word by checking surrounding characters
        const isBoundaryBefore = !charBefore || !/[a-z0-9]/i.test(charBefore)
        const isBoundaryAfter = !charAfter || !/[a-z0-9]/i.test(charAfter)

        if (isBoundaryBefore && isBoundaryAfter) {
          // Normalize obfuscated match (remove non-word chars)
          const normalized = match[0].replace(/[^a-z0-9]/gi, '')
          words.push({
            word: normalized,
            position: start
          })
        }
      }
    })

    // Deduplicate by word (keep first occurrence)
    const uniqueMap = new Map<string, { word: string; position: number }>()
    words.forEach(w => {
      const key = w.word.toLowerCase()
      if (!uniqueMap.has(key)) uniqueMap.set(key, w)
    })

    const uniqueWords = Array.from(uniqueMap.values())

    return {
      hasOffensive: uniqueWords.length > 0,
      words: uniqueWords
    }
  }

  /**
   * Get list of flagged words from text
   */
  public getFlaggedWords(text: string): string[] {
    const result = this.containsOffensiveWords(text)
    return result.words.map(w => w.word)
  }

  /**
   * Check for spam patterns
   */
  public containsSpam(text: string): { isSpam: boolean; patterns: string[] } {
    const foundPatterns: string[] = []

    this.spamPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        foundPatterns.push(pattern.toString())
      }
    })

    return {
      isSpam: foundPatterns.length > 0,
      patterns: foundPatterns
    }
  }

  /**
   * Check for invalid formatting
   */
  public hasInvalidFormat(text: string): boolean {
    // Check for excessive repeated characters
    if (/(.)\1{5,}/.test(text)) return true
    
    // Check for excessive caps (more than 50% uppercase in words > 3 chars)
    const words = text.split(/\s+/)
    const capsWords = words.filter(word => {
      if (word.length <= 3) return false
      const upperCount = (word.match(/[A-Z]/g) || []).length
      return upperCount / word.length > 0.5
    })
    if (capsWords.length > words.length * 0.3) return true

    // Check for excessive punctuation
    if (/[!?]{4,}/.test(text)) return true

    return false
  }

  /**
   * Sanitize text - remove extra whitespace and normalize
   */
  public sanitizeText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\n{3,}/g, '\n\n') // Multiple newlines to double newline
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * Add custom offensive word to blacklist (for admin management)
   */
  public addOffensiveWord(word: string): void {
    this.offensiveWords.add(word.toLowerCase())
  }

  /**
   * Remove word from blacklist (for admin management)
   */
  public removeOffensiveWord(word: string): void {
    this.offensiveWords.delete(word.toLowerCase())
  }

  /**
   * Get current blacklist size
   */
  public getBlacklistSize(): number {
    return this.offensiveWords.size
  }

  /**
   * Check if a specific word is in blacklist
   */
  public isWordBlacklisted(word: string): boolean {
    return this.offensiveWords.has(word.toLowerCase())
  }

  /**
   * Get suggestions for improving review quality
   */
  public getQualitySuggestions(text: string): string[] {
    const suggestions: string[] = []
    const wordCount = this.countWords(text)

    if (wordCount < 20) {
      suggestions.push('Consider adding more details about your experience')
    }

    if (!/[.!?]/.test(text)) {
      suggestions.push('Add proper punctuation to improve readability')
    }

    if (text === text.toUpperCase() && wordCount > 5) {
      suggestions.push('Avoid writing entirely in capital letters')
    }

    if (text === text.toLowerCase() && wordCount > 5) {
      suggestions.push('Use proper capitalization for better readability')
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentences.length === 1 && wordCount > 30) {
      suggestions.push('Break your review into multiple sentences for clarity')
    }

    return suggestions
  }
}

// Export singleton instance
export const moderationService = new ModerationService()
export default moderationService
