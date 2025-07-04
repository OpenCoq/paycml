import type { PatternMatcher, PatternMatcherConfig, MatchResult, TruthValue } from './types.js'

/**
 * Implementation of a Pattern Matcher for cognitive processing
 * 
 * This provides pattern matching capabilities for recognizing
 * and matching patterns in cognitive data structures.
 */
export class CognitivePatternMatcher implements PatternMatcher {
  private patterns: Map<string, PatternData> = new Map()
  private config: PatternMatcherConfig

  constructor(config: PatternMatcherConfig) {
    this.config = config
  }

  addPattern(pattern: Record<string, unknown>): void {
    const id = this.generatePatternId(pattern)
    const patternData: PatternData = {
      id,
      pattern,
      truthValue: { strength: 1.0, uncertainty: 0.0 },
      usageCount: 0,
      lastUsed: new Date(),
      complexity: this.calculateComplexity(pattern)
    }
    
    this.patterns.set(id, patternData)
  }

  removePattern(id: string): void {
    this.patterns.delete(id)
  }

  match(input: Record<string, unknown>): MatchResult[] {
    const results: MatchResult[] = []
    
    for (const patternData of this.patterns.values()) {
      const matchResult = this.matchPattern(patternData, input)
      if (matchResult && matchResult.confidence >= this.config.confidenceThreshold) {
        results.push(matchResult)
      }
    }
    
    // Sort by confidence descending
    results.sort((a, b) => b.confidence - a.confidence)
    
    // Limit results
    return results.slice(0, this.config.maxResults)
  }

  fuzzyMatch(input: Record<string, unknown>, threshold: number): MatchResult[] {
    const results: MatchResult[] = []
    
    for (const patternData of this.patterns.values()) {
      const matchResult = this.fuzzyMatchPattern(patternData, input, threshold)
      if (matchResult && matchResult.confidence >= threshold) {
        results.push(matchResult)
      }
    }
    
    // Sort by confidence descending
    results.sort((a, b) => b.confidence - a.confidence)
    
    return results.slice(0, this.config.maxResults)
  }

  /**
   * Generate a unique ID for a pattern
   */
  private generatePatternId(pattern: Record<string, unknown>): string {
    const patternString = JSON.stringify(pattern, Object.keys(pattern).sort())
    return `pattern_${this.hashString(patternString)}`
  }

  /**
   * Calculate complexity score for a pattern
   */
  private calculateComplexity(pattern: Record<string, unknown>): number {
    let complexity = 0
    
    const traverse = (obj: unknown, depth: number = 0): void => {
      if (depth > 10) return // Prevent infinite recursion
      
      if (Array.isArray(obj)) {
        complexity += obj.length * 0.1
        obj.forEach(item => traverse(item, depth + 1))
      } else if (typeof obj === 'object' && obj !== null) {
        const keys = Object.keys(obj)
        complexity += keys.length * 0.2
        keys.forEach(key => traverse((obj as Record<string, unknown>)[key], depth + 1))
      } else {
        complexity += 0.05
      }
    }
    
    traverse(pattern)
    return Math.min(complexity, 10) // Cap at 10
  }

  /**
   * Perform exact pattern matching
   */
  private matchPattern(patternData: PatternData, input: Record<string, unknown>): MatchResult | null {
    const bindings: Record<string, unknown> = {}
    const confidence = this.calculateMatchConfidence(patternData.pattern, input, bindings)
    
    if (confidence < this.config.confidenceThreshold) {
      return null
    }
    
    // Update pattern usage
    patternData.usageCount++
    patternData.lastUsed = new Date()
    
    return {
      patternId: patternData.id,
      confidence,
      bindings,
      truthValue: patternData.truthValue
    }
  }

  /**
   * Perform fuzzy pattern matching
   */
  private fuzzyMatchPattern(patternData: PatternData, input: Record<string, unknown>, threshold: number): MatchResult | null {
    const bindings: Record<string, unknown> = {}
    const confidence = this.calculateFuzzyMatchConfidence(patternData.pattern, input, bindings, threshold)
    
    if (confidence < threshold) {
      return null
    }
    
    // Update pattern usage
    patternData.usageCount++
    patternData.lastUsed = new Date()
    
    return {
      patternId: patternData.id,
      confidence,
      bindings,
      truthValue: {
        strength: patternData.truthValue.strength * confidence,
        uncertainty: patternData.truthValue.uncertainty + (1 - confidence) * 0.1
      }
    }
  }

  /**
   * Calculate exact match confidence
   */
  private calculateMatchConfidence(pattern: Record<string, unknown>, input: Record<string, unknown>, bindings: Record<string, unknown>): number {
    let totalFields = 0
    let matchedFields = 0
    
    const matchRecursive = (p: unknown, i: unknown, path: string = ''): boolean => {
      totalFields++
      
      if (this.isVariable(p)) {
        // Variable pattern - bind to input value
        const varName = this.getVariableName(p)
        bindings[varName] = i
        matchedFields++
        return true
      }
      
      if (Array.isArray(p) && Array.isArray(i)) {
        if (p.length !== i.length) return false
        
        for (let idx = 0; idx < p.length; idx++) {
          if (!matchRecursive(p[idx], i[idx], `${path}[${idx}]`)) {
            return false
          }
        }
        matchedFields++
        return true
      }
      
      if (typeof p === 'object' && p !== null && typeof i === 'object' && i !== null) {
        const pKeys = Object.keys(p)
        const iObj = i as Record<string, unknown>
        
        for (const key of pKeys) {
          if (!(key in iObj)) return false
          if (!matchRecursive((p as Record<string, unknown>)[key], iObj[key], `${path}.${key}`)) {
            return false
          }
        }
        matchedFields++
        return true
      }
      
      if (p === i) {
        matchedFields++
        return true
      }
      
      return false
    }
    
    const matched = matchRecursive(pattern, input)
    return matched ? matchedFields / totalFields : 0
  }

  /**
   * Calculate fuzzy match confidence
   */
  private calculateFuzzyMatchConfidence(pattern: Record<string, unknown>, input: Record<string, unknown>, bindings: Record<string, unknown>, threshold: number): number {
    let totalWeight = 0
    let matchWeight = 0
    
    const fuzzyMatchRecursive = (p: unknown, i: unknown, weight: number = 1): number => {
      totalWeight += weight
      
      if (this.isVariable(p)) {
        const varName = this.getVariableName(p)
        bindings[varName] = i
        matchWeight += weight
        return weight
      }
      
      if (Array.isArray(p) && Array.isArray(i)) {
        const maxLength = Math.max(p.length, i.length)
        const minLength = Math.min(p.length, i.length)
        
        let arrayMatch = 0
        for (let idx = 0; idx < minLength; idx++) {
          arrayMatch += fuzzyMatchRecursive(p[idx], i[idx], weight / maxLength)
        }
        
        // Penalty for length mismatch
        const lengthPenalty = (maxLength - minLength) / maxLength
        return arrayMatch * (1 - lengthPenalty)
      }
      
      if (typeof p === 'object' && p !== null && typeof i === 'object' && i !== null) {
        const pKeys = Object.keys(p)
        const iObj = i as Record<string, unknown>
        let objectMatch = 0
        
        for (const key of pKeys) {
          if (key in iObj) {
            objectMatch += fuzzyMatchRecursive((p as Record<string, unknown>)[key], iObj[key], weight / pKeys.length)
          }
        }
        
        return objectMatch
      }
      
      if (typeof p === 'string' && typeof i === 'string') {
        const similarity = this.stringSimilarity(p, i)
        const contribution = similarity * weight
        matchWeight += contribution
        return contribution
      }
      
      if (typeof p === 'number' && typeof i === 'number') {
        const similarity = this.numericSimilarity(p, i)
        const contribution = similarity * weight
        matchWeight += contribution
        return contribution
      }
      
      if (p === i) {
        matchWeight += weight
        return weight
      }
      
      return 0
    }
    
    fuzzyMatchRecursive(pattern, input)
    return totalWeight > 0 ? matchWeight / totalWeight : 0
  }

  /**
   * Check if a value is a variable pattern
   */
  private isVariable(value: unknown): boolean {
    return typeof value === 'string' && value.startsWith('$')
  }

  /**
   * Get variable name from pattern
   */
  private getVariableName(value: unknown): string {
    return typeof value === 'string' ? value.substring(1) : 'unknown'
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private stringSimilarity(a: string, b: string): number {
    const matrix: number[][] = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(0))
    
    for (let i = 0; i <= a.length; i++) matrix[0]![i] = i
    for (let j = 0; j <= b.length; j++) matrix[j]![0] = j
    
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        matrix[j]![i] = Math.min(
          matrix[j]![i - 1]! + 1,
          matrix[j - 1]![i]! + 1,
          matrix[j - 1]![i - 1]! + cost
        )
      }
    }
    
    const maxLength = Math.max(a.length, b.length)
    return maxLength > 0 ? 1 - (matrix[b.length]![a.length]! / maxLength) : 1
  }

  /**
   * Calculate numeric similarity
   */
  private numericSimilarity(a: number, b: number): number {
    const maxVal = Math.max(Math.abs(a), Math.abs(b))
    const diff = Math.abs(a - b)
    return maxVal > 0 ? 1 - (diff / maxVal) : 1
  }

  /**
   * Simple string hashing function
   */
  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Get pattern statistics
   */
  getStats(): {
    patternCount: number
    totalUsage: number
    averageComplexity: number
    mostUsedPattern: string | null
    recentPatterns: string[]
  } {
    const patterns = Array.from(this.patterns.values())
    const totalUsage = patterns.reduce((sum, p) => sum + p.usageCount, 0)
    const averageComplexity = patterns.length > 0 
      ? patterns.reduce((sum, p) => sum + p.complexity, 0) / patterns.length 
      : 0
    
    const mostUsed = patterns.length > 0 ? patterns.reduce((max, p) => 
      p.usageCount > max.usageCount ? p : max
    ) : null
    
    const recentPatterns = patterns
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, 5)
      .map(p => p.id)
    
    return {
      patternCount: patterns.length,
      totalUsage,
      averageComplexity,
      mostUsedPattern: mostUsed?.id || null,
      recentPatterns
    }
  }
}

/**
 * Internal pattern data structure
 */
interface PatternData {
  id: string
  pattern: Record<string, unknown>
  truthValue: TruthValue
  usageCount: number
  lastUsed: Date
  complexity: number
}

/**
 * Factory function to create a new pattern matcher
 */
export function createPatternMatcher(config: PatternMatcherConfig): PatternMatcher {
  return new CognitivePatternMatcher(config)
}