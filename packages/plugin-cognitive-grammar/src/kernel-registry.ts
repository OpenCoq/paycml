import type { 
  CognitiveKernel, 
  KernelRegistry, 
  KernelState, 
  KernelType 
} from './types.js'

/**
 * Implementation of the Cognitive Kernel Registry
 * 
 * This registry manages the lifecycle of cognitive kernels and provides
 * the foundational infrastructure for kernel activation and management.
 */
export class CognitiveKernelRegistry implements KernelRegistry {
  kernels: Map<string, CognitiveKernel> = new Map()
  states: Map<string, KernelState> = new Map()

  register(kernel: CognitiveKernel): void {
    this.kernels.set(kernel.id, kernel)
    this.states.set(kernel.id, {
      id: kernel.id,
      active: false,
      lastActivation: new Date(),
      activationCount: 0,
      currentAttention: 0,
      performance: 1.0,
      errors: [],
      outputs: {}
    })
  }

  unregister(id: string): void {
    this.kernels.delete(id)
    this.states.delete(id)
  }

  get(id: string): CognitiveKernel | undefined {
    return this.kernels.get(id)
  }

  getState(id: string): KernelState | undefined {
    return this.states.get(id)
  }

  async activate(id: string, input?: unknown): Promise<unknown> {
    const kernel = this.kernels.get(id)
    const state = this.states.get(id)
    
    if (!kernel || !state) {
      throw new Error(`Kernel ${id} not found`)
    }

    // Update kernel state
    state.active = true
    state.lastActivation = new Date()
    state.activationCount++
    state.errors = []

    try {
      // Process based on kernel type
      const result = await this.processKernel(kernel, input)
      
      // Update state with successful processing
      state.outputs = result as Record<string, unknown>
      state.performance = Math.min(1.0, state.performance + 0.01)
      
      return result
    } catch (error) {
      // Update state with error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      state.errors.push(errorMessage)
      state.performance = Math.max(0.0, state.performance - 0.1)
      
      throw error
    } finally {
      state.active = false
    }
  }

  deactivate(id: string): void {
    const state = this.states.get(id)
    if (state) {
      state.active = false
    }
  }

  list(): CognitiveKernel[] {
    return Array.from(this.kernels.values())
  }

  listByType(type: KernelType): CognitiveKernel[] {
    return Array.from(this.kernels.values()).filter(kernel => kernel.type === type)
  }

  /**
   * Process a kernel based on its type
   */
  private async processKernel(kernel: CognitiveKernel, input?: unknown): Promise<unknown> {
    switch (kernel.type) {
      case 'hypergraph-primitive':
        return this.processHypergraphPrimitive(kernel, input)
      
      case 'neural-symbolic-bridge':
        return this.processNeuralSymbolicBridge(kernel, input)
      
      case 'attention-allocation':
        return this.processAttentionAllocation(kernel, input)
      
      case 'pattern-matcher':
        return this.processPatternMatcher(kernel, input)
      
      case 'perception-layer':
        return this.processPerceptionLayer(kernel, input)
      
      case 'reasoning-engine':
        return this.processReasoningEngine(kernel, input)
      
      case 'memory-system':
        return this.processMemorySystem(kernel, input)
      
      case 'action-selector':
        return this.processActionSelector(kernel, input)
      
      default:
        throw new Error(`Unknown kernel type: ${kernel.type}`)
    }
  }

  /**
   * Process hypergraph primitive kernel
   */
  private async processHypergraphPrimitive(kernel: CognitiveKernel, input?: unknown): Promise<unknown> {
    // Implement hypergraph processing logic
    const nodes = kernel.hypergraphNodes
    const result = {
      type: 'hypergraph-result',
      nodeCount: nodes.length,
      processedNodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        truthValue: node.truthValue,
        attentionValue: node.attentionValue
      })),
      input,
      timestamp: new Date().toISOString()
    }
    
    return result
  }

  /**
   * Process neural-symbolic bridge kernel
   */
  private async processNeuralSymbolicBridge(kernel: CognitiveKernel, input?: unknown): Promise<unknown> {
    // Implement neural-symbolic bridging logic
    const neuralLayers = kernel.neuralLayers || []
    const symbolicRules = kernel.symbolicRules || []
    
    // Simulate neural processing
    let neuralOutput = input
    for (const layer of neuralLayers) {
      neuralOutput = this.processNeuralLayer(layer, neuralOutput)
    }
    
    // Apply symbolic rules
    const symbolicOutput = this.applySymbolicRules(symbolicRules, neuralOutput)
    
    return {
      type: 'neural-symbolic-result',
      neuralOutput,
      symbolicOutput,
      layerCount: neuralLayers.length,
      ruleCount: symbolicRules.length,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Process attention allocation kernel
   */
  private processAttentionAllocation(kernel: CognitiveKernel, _input?: unknown): unknown {
    // Implement attention allocation logic
    const budget = kernel.attentionBudget
    const priority = kernel.priority
    
    // Calculate attention allocation based on priority and current state
    const allocation = Math.min(budget, priority * 0.1)
    
    return {
      type: 'attention-allocation-result',
      allocation,
      budget,
      priority,
      efficiency: allocation / budget,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Process pattern matcher kernel
   */
  private async processPatternMatcher(kernel: CognitiveKernel, input?: unknown): Promise<unknown> {
    // Implement pattern matching logic
    const patterns = kernel.hypergraphNodes.map(node => ({
      id: node.id,
      pattern: node.metadata,
      truthValue: node.truthValue
    }))
    
    // Simple pattern matching simulation
    const matches = patterns.filter(pattern => {
      if (typeof input === 'object' && input !== null) {
        const inputObj = input as Record<string, unknown>
        return Object.keys(pattern.pattern).some(key => 
          key in inputObj && inputObj[key] === pattern.pattern[key]
        )
      }
      return false
    })
    
    return {
      type: 'pattern-matching-result',
      matches,
      matchCount: matches.length,
      totalPatterns: patterns.length,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Process perception layer kernel
   */
  private async processPerceptionLayer(kernel: CognitiveKernel, input?: unknown): Promise<unknown> {
    // Implement perception processing
    const layers = kernel.neuralLayers || []
    let output = input
    
    for (const layer of layers) {
      output = this.processNeuralLayer(layer, output)
    }
    
    return {
      type: 'perception-result',
      output,
      layerCount: layers.length,
      tensorShape: kernel.tensorShape,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Process reasoning engine kernel
   */
  private async processReasoningEngine(kernel: CognitiveKernel, input?: unknown): Promise<unknown> {
    // Implement reasoning logic
    const rules = kernel.symbolicRules || []
    const premises = Array.isArray(input) ? input : [input]
    
    // Simple forward chaining
    const conclusions = []
    for (const rule of rules) {
      const matches = rule.premise.filter(p => premises.some(premise => 
        typeof premise === 'string' && premise.includes(p)
      ))
      
      if (matches.length === rule.premise.length) {
        conclusions.push({
          conclusion: rule.conclusion,
          rule: rule.name,
          truthValue: rule.truthValue,
          premises: matches
        })
      }
    }
    
    return {
      type: 'reasoning-result',
      conclusions,
      ruleCount: rules.length,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Process memory system kernel
   */
  private async processMemorySystem(kernel: CognitiveKernel, input?: unknown): Promise<unknown> {
    // Implement memory processing
    const nodes = kernel.hypergraphNodes
    const memoryCapacity = kernel.complexity * 10
    
    // Simulate memory storage and retrieval
    const memories = nodes.slice(0, memoryCapacity).map(node => ({
      id: node.id,
      content: node.metadata,
      importance: node.attentionValue.shortTermImportance,
      lastAccessed: new Date().toISOString()
    }))
    
    return {
      type: 'memory-result',
      memories,
      capacity: memoryCapacity,
      usage: memories.length / memoryCapacity,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Process action selector kernel
   */
  private processActionSelector(kernel: CognitiveKernel, _input?: unknown): unknown {
    // Implement action selection logic
    const options = kernel.hypergraphNodes.map((node: any) => ({
      action: node.id,
      utility: node.attentionValue.shortTermImportance * node.truthValue.strength,
      confidence: node.truthValue.strength
    }))
    
    // Select best action
    const bestAction = options.reduce((best: any, current: any) => 
      current.utility > best.utility ? current : best
    )
    
    return {
      type: 'action-selection-result',
      selectedAction: bestAction,
      options,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Simple neural layer processing simulation
   */
  private processNeuralLayer(layer: any, input: unknown): unknown {
    // This is a simplified simulation - real implementation would use actual neural network libraries
    if (typeof input === 'number') {
      switch (layer.activation) {
        case 'relu':
          return Math.max(0, input)
        case 'sigmoid':
          return 1 / (1 + Math.exp(-input))
        case 'tanh':
          return Math.tanh(input)
        default:
          return input
      }
    }
    return input
  }

  /**
   * Apply symbolic rules to data
   */
  private applySymbolicRules(rules: any[], input: unknown): unknown {
    // Simplified symbolic rule application
    const result: { input: unknown; rules: number; applied: string[] } = { 
      input, 
      rules: rules.length, 
      applied: [] 
    }
    
    for (const rule of rules) {
      if (rule.premise.some((p: string) => 
        typeof input === 'string' && input.includes(p)
      )) {
        (result.applied as string[]).push(rule.name)
      }
    }
    
    return result
  }
}

/**
 * Factory function to create a new kernel registry
 */
export function createKernelRegistry(): KernelRegistry {
  return new CognitiveKernelRegistry()
}