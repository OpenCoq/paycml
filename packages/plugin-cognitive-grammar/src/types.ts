// import type { Config } from 'payload'

// Simple Config interface to avoid dependency issues during development
interface Config {
  collections?: any[]
  endpoints?: any[]
  globals?: any[]
}

// Core tensor shape definition based on the issue requirements
export interface TensorShape {
  dimensions: number[]
  dtype: 'float32' | 'float64' | 'int32' | 'int64' | 'boolean' | 'string'
  complexity: number
}

// Hypergraph node inspired by AtomSpace methodology
export interface HypergraphNode {
  id: string
  type: string
  truthValue: TruthValue
  attentionValue: AttentionValue
  outgoing: string[]
  incoming: string[]
  metadata: Record<string, unknown>
}

// Probabilistic truth value for PLN engine
export interface TruthValue {
  strength: number // [0, 1]
  uncertainty: number // [0, 1]
}

// ECAN-inspired attention value
export interface AttentionValue {
  shortTermImportance: number
  longTermImportance: number
  vlti: boolean // Very Long Term Importance
}

// Neural perception layer interface
export interface NeuralPerceptionLayer {
  name: string
  inputShape: TensorShape
  outputShape: TensorShape
  weights?: number[]
  biases?: number[]
  activation: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'linear'
}

// Symbolic reasoning rule
export interface SymbolicRule {
  id: string
  name: string
  premise: string[]
  conclusion: string
  truthValue: TruthValue
  variables: Record<string, string>
}

// Cognitive kernel definition
export interface CognitiveKernel {
  id: string
  name: string
  description: string
  type: KernelType
  tensorShape: TensorShape
  complexity: number
  dependencies: string[]
  hypergraphNodes: HypergraphNode[]
  neuralLayers?: NeuralPerceptionLayer[]
  symbolicRules?: SymbolicRule[]
  attentionBudget: number
  priority: number
  metadata: Record<string, unknown>
}

// Kernel types based on the issue requirements
export type KernelType = 
  | 'hypergraph-primitive'
  | 'neural-symbolic-bridge'
  | 'attention-allocation'
  | 'pattern-matcher'
  | 'perception-layer'
  | 'reasoning-engine'
  | 'memory-system'
  | 'action-selector'

// Attention allocation configuration
export interface AttentionAllocationConfig {
  totalBudget: number
  modules: Record<string, number>
  decayRate: number
  focusThreshold: number
  emergencyAllocation: number
}

// Pattern matcher configuration
export interface PatternMatcherConfig {
  maxDepth: number
  maxResults: number
  confidenceThreshold: number
  useApproximateMatching: boolean
}

// Neural-symbolic bridge configuration
export interface NeuralSymbolicBridgeConfig {
  activationThreshold: number
  symbolicMappingRules: Record<string, string>
  neuralToSymbolicMapping: Record<string, string>
  symbolicToNeuralMapping: Record<string, string>
}

// Main plugin configuration
export interface CognitiveGrammarPluginConfig {
  enabled?: boolean
  debug?: boolean
  kernels: CognitiveKernel[]
  attentionAllocation?: AttentionAllocationConfig
  patternMatcher?: PatternMatcherConfig
  neuralSymbolicBridge?: NeuralSymbolicBridgeConfig
  collections?: {
    [collectionSlug: string]: {
      enableCognitiveProcessing?: boolean
      kernels?: string[]
      attentionWeight?: number
    }
  }
}

// Runtime kernel state
export interface KernelState {
  id: string
  active: boolean
  lastActivation: Date
  activationCount: number
  currentAttention: number
  performance: number
  errors: string[]
  outputs: Record<string, unknown>
}

// Kernel registry interface
export interface KernelRegistry {
  kernels: Map<string, CognitiveKernel>
  states: Map<string, KernelState>
  register(kernel: CognitiveKernel): void
  unregister(id: string): void
  get(id: string): CognitiveKernel | undefined
  getState(id: string): KernelState | undefined
  activate(id: string, input?: unknown): Promise<unknown>
  deactivate(id: string): void
  list(): CognitiveKernel[]
  listByType(type: KernelType): CognitiveKernel[]
}

// Hypergraph interface
export interface Hypergraph {
  nodes: Map<string, HypergraphNode>
  addNode(node: HypergraphNode): void
  removeNode(id: string): void
  addLink(from: string, to: string): void
  removeLink(from: string, to: string): void
  getNode(id: string): HypergraphNode | undefined
  getIncoming(id: string): HypergraphNode[]
  getOutgoing(id: string): HypergraphNode[]
  query(pattern: Record<string, unknown>): HypergraphNode[]
  traverse(startId: string, maxDepth: number): HypergraphNode[]
}

// Attention allocator interface
export interface AttentionAllocator {
  budget: number
  allocations: Map<string, number>
  allocate(moduleId: string, amount: number): boolean
  deallocate(moduleId: string, amount: number): boolean
  redistribute(): void
  getBudget(): number
  getAvailable(): number
  getAllocation(moduleId: string): number
}

// Pattern matcher interface
export interface PatternMatcher {
  addPattern(pattern: Record<string, unknown>): void
  removePattern(id: string): void
  match(input: Record<string, unknown>): MatchResult[]
  fuzzyMatch(input: Record<string, unknown>, threshold: number): MatchResult[]
}

export interface MatchResult {
  patternId: string
  confidence: number
  bindings: Record<string, unknown>
  truthValue: TruthValue
}

// PLN inference engine interface
export interface PLNEngine {
  addRule(rule: SymbolicRule): void
  removeRule(id: string): void
  infer(premises: string[], maxSteps: number): InferenceResult[]
  forwardChain(premises: string[]): InferenceResult[]
  backwardChain(goal: string): InferenceResult[]
}

export interface InferenceResult {
  conclusion: string
  premises: string[]
  rule: string
  truthValue: TruthValue
  confidence: number
  steps: number
}

// Plugin function type
export type CognitiveGrammarPlugin = (config: CognitiveGrammarPluginConfig) => (incomingConfig: Config) => Config