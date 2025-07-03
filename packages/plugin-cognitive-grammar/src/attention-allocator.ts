import type { AttentionAllocator, AttentionAllocationConfig } from './types.js'

/**
 * Implementation of ECAN-inspired Attention Allocator
 * 
 * This provides economic attention allocation mechanisms for managing
 * cognitive resources across different modules and kernels.
 */
export class CognitiveAttentionAllocator implements AttentionAllocator {
  budget: number
  allocations: Map<string, number> = new Map()
  private config: AttentionAllocationConfig
  private lastUpdate: Date = new Date()

  constructor(config: AttentionAllocationConfig) {
    this.config = config
    this.budget = config.totalBudget
    
    // Initialize module allocations
    for (const [moduleId, allocation] of Object.entries(config.modules)) {
      this.allocations.set(moduleId, allocation)
    }
  }

  allocate(moduleId: string, amount: number): boolean {
    const currentAllocation = this.allocations.get(moduleId) || 0
    const totalAllocated = this.getTotalAllocated()
    
    // Check if we have enough budget
    if (totalAllocated + amount > this.budget) {
      // Try to redistribute if possible
      if (this.canRedistribute(amount)) {
        this.redistributeWithAmount(amount)
      } else {
        return false
      }
    }
    
    this.allocations.set(moduleId, currentAllocation + amount)
    return true
  }

  deallocate(moduleId: string, amount: number): boolean {
    const currentAllocation = this.allocations.get(moduleId) || 0
    
    if (currentAllocation < amount) {
      return false
    }
    
    this.allocations.set(moduleId, currentAllocation - amount)
    return true
  }

  redistribute(): void {
    const totalAllocated = this.getTotalAllocated()
    
    // If over budget, apply emergency redistribution
    if (totalAllocated > this.budget) {
      this.applyEmergencyRedistribution()
    } else {
      // Apply normal decay and reallocation
      this.applyDecay()
      this.rebalanceAllocations()
    }
    
    this.lastUpdate = new Date()
  }

  getBudget(): number {
    return this.budget
  }

  getAvailable(): number {
    return this.budget - this.getTotalAllocated()
  }

  getAllocation(moduleId: string): number {
    return this.allocations.get(moduleId) || 0
  }

  /**
   * Get total currently allocated attention
   */
  private getTotalAllocated(): number {
    return Array.from(this.allocations.values()).reduce((sum, allocation) => sum + allocation, 0)
  }

  /**
   * Check if we can redistribute to make room for new allocation
   */
  private canRedistribute(requiredAmount: number): boolean {
    const available = this.getAvailable()
    const emergencyPool = this.config.emergencyAllocation
    
    return available + emergencyPool >= requiredAmount
  }

  /**
   * Redistribute attention with the specified amount needed
   */
  private redistributeWithAmount(requiredAmount: number): void {
    const available = this.getAvailable()
    
    if (available >= requiredAmount) {
      return // No redistribution needed
    }
    
    const deficit = requiredAmount - available
    
    // Take from modules with lowest priority first
    const moduleEntries = Array.from(this.allocations.entries())
      .sort((a, b) => a[1] - b[1]) // Sort by allocation amount (proxy for priority)
    
    let redistributed = 0
    for (const [moduleId, allocation] of moduleEntries) {
      if (redistributed >= deficit) break
      
      const reduction = Math.min(allocation * 0.1, deficit - redistributed)
      this.allocations.set(moduleId, allocation - reduction)
      redistributed += reduction
    }
  }

  /**
   * Apply emergency redistribution when over budget
   */
  private applyEmergencyRedistribution(): void {
    const totalAllocated = this.getTotalAllocated()
    const excess = totalAllocated - this.budget
    
    // Reduce all allocations proportionally
    const reductionFactor = excess / totalAllocated
    
    for (const [moduleId, allocation] of this.allocations.entries()) {
      const reduction = allocation * reductionFactor
      this.allocations.set(moduleId, Math.max(0, allocation - reduction))
    }
  }

  /**
   * Apply decay to attention allocations over time
   */
  private applyDecay(): void {
    const timeDelta = (new Date().getTime() - this.lastUpdate.getTime()) / 1000 // seconds
    const decayFactor = Math.pow(this.config.decayRate, timeDelta)
    
    for (const [moduleId, allocation] of this.allocations.entries()) {
      const decayedAllocation = allocation * decayFactor
      this.allocations.set(moduleId, Math.max(0, decayedAllocation))
    }
  }

  /**
   * Rebalance allocations based on focus threshold
   */
  private rebalanceAllocations(): void {
    const focusThreshold = this.config.focusThreshold
    const totalAllocated = this.getTotalAllocated()
    
    // Identify modules above focus threshold
    const focusedModules = Array.from(this.allocations.entries())
      .filter(([, allocation]) => allocation > focusThreshold)
    
    // Boost focused modules slightly
    for (const [moduleId, allocation] of focusedModules) {
      const boost = Math.min(allocation * 0.05, this.getAvailable() * 0.1)
      this.allocations.set(moduleId, allocation + boost)
    }
  }

  /**
   * Get attention allocation statistics
   */
  getStats(): {
    totalBudget: number
    totalAllocated: number
    available: number
    utilization: number
    moduleCount: number
    topModules: Array<{ moduleId: string; allocation: number }>
    averageAllocation: number
  } {
    const totalAllocated = this.getTotalAllocated()
    const moduleEntries = Array.from(this.allocations.entries())
    
    const topModules = moduleEntries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([moduleId, allocation]) => ({ moduleId, allocation }))
    
    return {
      totalBudget: this.budget,
      totalAllocated,
      available: this.getAvailable(),
      utilization: totalAllocated / this.budget,
      moduleCount: this.allocations.size,
      topModules,
      averageAllocation: this.allocations.size > 0 ? totalAllocated / this.allocations.size : 0
    }
  }

  /**
   * Simulate attention competition between modules
   */
  simulateCompetition(demands: Map<string, number>): Map<string, number> {
    const results = new Map<string, number>()
    const totalDemand = Array.from(demands.values()).reduce((sum, demand) => sum + demand, 0)
    
    // If total demand exceeds budget, use competitive allocation
    if (totalDemand > this.budget) {
      for (const [moduleId, demand] of demands.entries()) {
        const currentAllocation = this.allocations.get(moduleId) || 0
        const competitiveWeight = currentAllocation / this.getTotalAllocated()
        const allocation = this.budget * competitiveWeight
        results.set(moduleId, Math.min(demand, allocation))
      }
    } else {
      // Satisfy all demands
      for (const [moduleId, demand] of demands.entries()) {
        results.set(moduleId, demand)
      }
    }
    
    return results
  }

  /**
   * Update budget and rebalance if necessary
   */
  updateBudget(newBudget: number): void {
    const oldBudget = this.budget
    this.budget = newBudget
    
    // If budget decreased, proportionally reduce allocations
    if (newBudget < oldBudget) {
      const reductionFactor = newBudget / oldBudget
      for (const [moduleId, allocation] of this.allocations.entries()) {
        this.allocations.set(moduleId, allocation * reductionFactor)
      }
    }
  }

  /**
   * Get module priority based on allocation and performance
   */
  getModulePriority(moduleId: string): number {
    const allocation = this.allocations.get(moduleId) || 0
    const totalAllocated = this.getTotalAllocated()
    
    return totalAllocated > 0 ? allocation / totalAllocated : 0
  }

  /**
   * Export current state for persistence
   */
  exportState(): {
    budget: number
    allocations: Record<string, number>
    config: AttentionAllocationConfig
    lastUpdate: string
  } {
    return {
      budget: this.budget,
      allocations: Object.fromEntries(this.allocations),
      config: this.config,
      lastUpdate: this.lastUpdate.toISOString()
    }
  }

  /**
   * Import state from persistence
   */
  importState(state: {
    budget: number
    allocations: Record<string, number>
    config: AttentionAllocationConfig
    lastUpdate: string
  }): void {
    this.budget = state.budget
    this.allocations = new Map(Object.entries(state.allocations))
    this.config = state.config
    this.lastUpdate = new Date(state.lastUpdate)
  }
}

/**
 * Factory function to create a new attention allocator
 */
export function createAttentionAllocator(config: AttentionAllocationConfig): AttentionAllocator {
  return new CognitiveAttentionAllocator(config)
}