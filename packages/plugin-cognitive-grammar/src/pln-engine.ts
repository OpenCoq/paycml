import type { PLNEngine, SymbolicRule, InferenceResult, TruthValue } from './types.js'

/**
 * Implementation of a Probabilistic Logic Network (PLN) Engine
 * 
 * This provides logical inference capabilities with probabilistic truth values
 * for symbolic reasoning in cognitive architectures.
 */
export class CognitivePLNEngine implements PLNEngine {
  private rules: Map<string, SymbolicRule> = new Map()
  private facts: Map<string, TruthValue> = new Map()
  private maxInferenceDepth: number = 10

  addRule(rule: SymbolicRule): void {
    this.rules.set(rule.id, rule)
  }

  removeRule(id: string): void {
    this.rules.delete(id)
  }

  infer(premises: string[], maxSteps: number = 10): InferenceResult[] {
    // Initialize working memory with premises
    const workingMemory = new Map<string, TruthValue>()
    premises.forEach(premise => {
      workingMemory.set(premise, { strength: 1.0, uncertainty: 0.0 })
    })
    
    const results: InferenceResult[] = []
    const usedRules = new Set<string>()
    
    // Perform inference steps
    for (let step = 0; step < maxSteps; step++) {
      const newInferences = this.performInferenceStep(workingMemory, usedRules)
      
      if (newInferences.length === 0) {
        break // No new inferences possible
      }
      
      // Add new inferences to working memory and results
      newInferences.forEach(inference => {
        workingMemory.set(inference.conclusion, inference.truthValue)
        results.push({ ...inference, steps: step + 1 })
      })
    }
    
    return results.sort((a, b) => b.confidence - a.confidence)
  }

  forwardChain(premises: string[]): InferenceResult[] {
    const results: InferenceResult[] = []
    const workingMemory = new Map<string, TruthValue>()
    
    // Initialize with premises
    premises.forEach(premise => {
      workingMemory.set(premise, { strength: 1.0, uncertainty: 0.0 })
    })
    
    let changed = true
    let steps = 0
    
    while (changed && steps < this.maxInferenceDepth) {
      changed = false
      steps++
      
      for (const rule of this.rules.values()) {
        if (this.canApplyRule(rule, workingMemory)) {
          const inference = this.applyRule(rule, workingMemory)
          if (inference && !workingMemory.has(inference.conclusion)) {
            workingMemory.set(inference.conclusion, inference.truthValue)
            results.push({ ...inference, steps })
            changed = true
          }
        }
      }
    }
    
    return results.sort((a, b) => b.confidence - a.confidence)
  }

  backwardChain(goal: string): InferenceResult[] {
    const results: InferenceResult[] = []
    const visited = new Set<string>()
    
    const backtrack = (currentGoal: string, depth: number = 0): InferenceResult[] => {
      if (depth > this.maxInferenceDepth || visited.has(currentGoal)) {
        return []
      }
      
      visited.add(currentGoal)
      const localResults: InferenceResult[] = []
      
      // Check if goal is already known
      if (this.facts.has(currentGoal)) {
        return [{
          conclusion: currentGoal,
          premises: [],
          rule: 'fact',
          truthValue: this.facts.get(currentGoal)!,
          confidence: this.facts.get(currentGoal)!.strength,
          steps: depth
        }]
      }
      
      // Find rules that can prove the goal
      for (const rule of this.rules.values()) {
        if (rule.conclusion === currentGoal) {
          // Try to prove all premises
          const premiseProofs: InferenceResult[][] = []
          let allPremisesProvable = true
          
          for (const premise of rule.premise) {
            const premiseResults = backtrack(premise, depth + 1)
            if (premiseResults.length === 0) {
              allPremisesProvable = false
              break
            }
            premiseProofs.push(premiseResults)
          }
          
          if (allPremisesProvable) {
            // Combine truth values from premise proofs
            const combinedTruthValue = this.combineTruthValues(
              premiseProofs.flat().map(p => p.truthValue)
            )
            
            const inference: InferenceResult = {
              conclusion: currentGoal,
              premises: rule.premise,
              rule: rule.id,
              truthValue: this.combineRuleTruthValue(rule.truthValue, combinedTruthValue),
              confidence: this.calculateConfidence(rule.truthValue, combinedTruthValue),
              steps: depth
            }
            
            localResults.push(inference)
          }
        }
      }
      
      return localResults
    }
    
    return backtrack(goal).sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Perform a single inference step
   */
  private performInferenceStep(workingMemory: Map<string, TruthValue>, usedRules: Set<string>): InferenceResult[] {
    const inferences: InferenceResult[] = []
    
    for (const rule of this.rules.values()) {
      if (usedRules.has(rule.id)) continue
      
      if (this.canApplyRule(rule, workingMemory)) {
        const inference = this.applyRule(rule, workingMemory)
        if (inference) {
          inferences.push(inference)
          usedRules.add(rule.id)
        }
      }
    }
    
    return inferences
  }

  /**
   * Check if a rule can be applied given the current working memory
   */
  private canApplyRule(rule: SymbolicRule, workingMemory: Map<string, TruthValue>): boolean {
    return rule.premise.every(premise => 
      workingMemory.has(premise) || this.matchesPattern(premise, workingMemory)
    )
  }

  /**
   * Apply a rule to derive new knowledge
   */
  private applyRule(rule: SymbolicRule, workingMemory: Map<string, TruthValue>): InferenceResult | null {
    const premiseTruthValues: TruthValue[] = []
    const matchedPremises: string[] = []
    
    for (const premise of rule.premise) {
      const truthValue = workingMemory.get(premise)
      if (truthValue) {
        premiseTruthValues.push(truthValue)
        matchedPremises.push(premise)
      } else {
        // Try pattern matching
        const match = this.findPatternMatch(premise, workingMemory)
        if (match) {
          premiseTruthValues.push(match.truthValue)
          matchedPremises.push(match.fact)
        } else {
          return null
        }
      }
    }
    
    // Combine truth values
    const combinedTruthValue = this.combineTruthValues(premiseTruthValues)
    const resultTruthValue = this.combineRuleTruthValue(rule.truthValue, combinedTruthValue)
    
    return {
      conclusion: rule.conclusion,
      premises: matchedPremises,
      rule: rule.id,
      truthValue: resultTruthValue,
      confidence: this.calculateConfidence(rule.truthValue, combinedTruthValue),
      steps: 1
    }
  }

  /**
   * Check if a premise matches any pattern in working memory
   */
  private matchesPattern(premise: string, workingMemory: Map<string, TruthValue>): boolean {
    for (const fact of workingMemory.keys()) {
      if (this.isPatternMatch(premise, fact)) {
        return true
      }
    }
    return false
  }

  /**
   * Find a pattern match in working memory
   */
  private findPatternMatch(premise: string, workingMemory: Map<string, TruthValue>): { fact: string, truthValue: TruthValue } | null {
    for (const [fact, truthValue] of workingMemory.entries()) {
      if (this.isPatternMatch(premise, fact)) {
        return { fact, truthValue }
      }
    }
    return null
  }

  /**
   * Simple pattern matching (supports basic wildcards)
   */
  private isPatternMatch(pattern: string, fact: string): boolean {
    if (pattern === fact) return true
    
    // Handle wildcard patterns
    if (pattern.includes('*')) {
      const regexPattern = pattern.replace(/\*/g, '.*')
      return new RegExp(`^${regexPattern}$`).test(fact)
    }
    
    // Handle variable patterns
    if (pattern.startsWith('$')) {
      return true // Variables match anything
    }
    
    return false
  }

  /**
   * Combine multiple truth values using PLN formulas
   */
  private combineTruthValues(truthValues: TruthValue[]): TruthValue {
    if (truthValues.length === 0) {
      return { strength: 0, uncertainty: 1 }
    }
    
    if (truthValues.length === 1) {
      return truthValues[0]!
    }
    
    // Use conjunction for multiple premises
    let strength = 1.0
    let uncertainty = 0.0
    
    for (const tv of truthValues) {
      strength *= tv.strength
      uncertainty += tv.uncertainty * (1 - uncertainty)
    }
    
    return { strength, uncertainty: Math.min(uncertainty, 1.0) }
  }

  /**
   * Combine rule truth value with premise truth values
   */
  private combineRuleTruthValue(ruleTruthValue: TruthValue, premiseTruthValue: TruthValue): TruthValue {
    // Deduction formula: strength of conclusion = strength of rule * strength of premise
    const strength = ruleTruthValue.strength * premiseTruthValue.strength
    
    // Combine uncertainties
    const uncertainty = ruleTruthValue.uncertainty + premiseTruthValue.uncertainty - 
                       (ruleTruthValue.uncertainty * premiseTruthValue.uncertainty)
    
    return { strength, uncertainty: Math.min(uncertainty, 1.0) }
  }

  /**
   * Calculate confidence based on strength and uncertainty
   */
  private calculateConfidence(ruleTruthValue: TruthValue, premiseTruthValue: TruthValue): number {
    const combinedTruthValue = this.combineRuleTruthValue(ruleTruthValue, premiseTruthValue)
    return combinedTruthValue.strength * (1 - combinedTruthValue.uncertainty)
  }

  /**
   * Add a fact to the knowledge base
   */
  addFact(fact: string, truthValue: TruthValue): void {
    this.facts.set(fact, truthValue)
  }

  /**
   * Remove a fact from the knowledge base
   */
  removeFact(fact: string): void {
    this.facts.delete(fact)
  }

  /**
   * Get all known facts
   */
  getFacts(): Map<string, TruthValue> {
    return new Map(this.facts)
  }

  /**
   * Query for a specific fact
   */
  queryFact(fact: string): TruthValue | null {
    return this.facts.get(fact) || null
  }

  /**
   * Get engine statistics
   */
  getStats(): {
    ruleCount: number
    factCount: number
    averageRuleComplexity: number
    mostUsedRules: string[]
    recentInferences: number
  } {
    const rules = Array.from(this.rules.values())
    const averageRuleComplexity = rules.length > 0 
      ? rules.reduce((sum, rule) => sum + rule.premise.length, 0) / rules.length 
      : 0
    
    return {
      ruleCount: rules.length,
      factCount: this.facts.size,
      averageRuleComplexity,
      mostUsedRules: rules.slice(0, 5).map(r => r.id),
      recentInferences: 0 // Would need to track this in a real implementation
    }
  }

  /**
   * Explain an inference result
   */
  explainInference(result: InferenceResult): string {
    const explanation = [
      `Conclusion: ${result.conclusion}`,
      `Rule: ${result.rule}`,
      `Premises: ${result.premises.join(', ')}`,
      `Truth Value: strength=${result.truthValue.strength.toFixed(3)}, uncertainty=${result.truthValue.uncertainty.toFixed(3)}`,
      `Confidence: ${result.confidence.toFixed(3)}`,
      `Steps: ${result.steps}`
    ]
    
    return explanation.join('\n')
  }

  /**
   * Clear all rules and facts
   */
  clear(): void {
    this.rules.clear()
    this.facts.clear()
  }
}

/**
 * Factory function to create a new PLN engine
 */
export function createPLNEngine(): PLNEngine {
  return new CognitivePLNEngine()
}