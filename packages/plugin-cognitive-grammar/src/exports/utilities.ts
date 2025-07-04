// Utility functions for working with cognitive kernels
import type { CognitiveKernel, TensorShape, TruthValue, HypergraphNode } from '../types.js'

/**
 * Calculate the total size of a tensor shape
 */
export function calculateTensorSize(shape: TensorShape): number {
  return shape.dimensions.reduce((product, dim) => product * dim, 1)
}

/**
 * Create a default tensor shape
 */
export function createDefaultTensorShape(dimensions: number[]): TensorShape {
  return {
    dimensions,
    dtype: 'float32',
    complexity: Math.min(dimensions.length, 10)
  }
}

/**
 * Create a default truth value
 */
export function createDefaultTruthValue(strength: number = 1.0, uncertainty: number = 0.0): TruthValue {
  return {
    strength: Math.max(0, Math.min(1, strength)),
    uncertainty: Math.max(0, Math.min(1, uncertainty))
  }
}

/**
 * Combine two truth values
 */
export function combineTruthValues(tv1: TruthValue, tv2: TruthValue): TruthValue {
  const strength = tv1.strength * tv2.strength
  const uncertainty = tv1.uncertainty + tv2.uncertainty - (tv1.uncertainty * tv2.uncertainty)
  return {
    strength,
    uncertainty: Math.min(uncertainty, 1.0)
  }
}

/**
 * Calculate confidence from truth value
 */
export function calculateConfidence(truthValue: TruthValue): number {
  return truthValue.strength * (1 - truthValue.uncertainty)
}

/**
 * Create a basic hypergraph node
 */
export function createHypergraphNode(
  id: string,
  type: string,
  metadata: Record<string, unknown> = {}
): HypergraphNode {
  return {
    id,
    type,
    truthValue: createDefaultTruthValue(),
    attentionValue: {
      shortTermImportance: 0.5,
      longTermImportance: 0.5,
      vlti: false
    },
    outgoing: [],
    incoming: [],
    metadata
  }
}

/**
 * Validate a kernel configuration
 */
export function validateKernel(kernel: CognitiveKernel): string[] {
  const errors: string[] = []
  
  if (!kernel.id || kernel.id.trim() === '') {
    errors.push('Kernel ID is required')
  }
  
  if (!kernel.name || kernel.name.trim() === '') {
    errors.push('Kernel name is required')
  }
  
  if (!kernel.tensorShape || !kernel.tensorShape.dimensions || kernel.tensorShape.dimensions.length === 0) {
    errors.push('Tensor shape with dimensions is required')
  }
  
  if (kernel.attentionBudget < 0 || kernel.attentionBudget > 1) {
    errors.push('Attention budget must be between 0 and 1')
  }
  
  if (kernel.priority < 0 || kernel.priority > 10) {
    errors.push('Priority must be between 0 and 10')
  }
  
  // Check for circular dependencies
  if (kernel.dependencies.includes(kernel.id)) {
    errors.push('Kernel cannot depend on itself')
  }
  
  return errors
}

/**
 * Create a kernel template
 */
export function createKernelTemplate(
  id: string,
  name: string,
  type: CognitiveKernel['type'],
  tensorDimensions: number[]
): CognitiveKernel {
  return {
    id,
    name,
    description: `${name} kernel for ${type} processing`,
    type,
    tensorShape: createDefaultTensorShape(tensorDimensions),
    complexity: Math.min(tensorDimensions.length, 10),
    dependencies: [],
    hypergraphNodes: [],
    attentionBudget: 0.1,
    priority: 5,
    metadata: {
      created: new Date().toISOString(),
      version: '1.0.0'
    }
  }
}

/**
 * Convert kernel to Scheme-like configuration
 */
export function kernelToScheme(kernel: CognitiveKernel): string {
  const lines = [
    `;; Cognitive Kernel: ${kernel.name}`,
    `(define-kernel ${kernel.id}`,
    `  :name "${kernel.name}"`,
    `  :type ${kernel.type}`,
    `  :tensor-shape (${kernel.tensorShape.dimensions.join(' ')})`,
    `  :attention-budget ${kernel.attentionBudget}`,
    `  :priority ${kernel.priority}`,
    `  :complexity ${kernel.complexity}`,
  ]
  
  if (kernel.dependencies.length > 0) {
    lines.push(`  :dependencies (${kernel.dependencies.join(' ')})`)
  }
  
  if (kernel.hypergraphNodes.length > 0) {
    lines.push(`  :hypergraph-nodes (`)
    for (const node of kernel.hypergraphNodes) {
      lines.push(`    (node :id "${node.id}" :type "${node.type}")`)
    }
    lines.push(`  )`)
  }
  
  lines.push(`)`)
  lines.push(``)
  
  return lines.join('\n')
}

/**
 * Calculate kernel importance score
 */
export function calculateKernelImportance(kernel: CognitiveKernel): number {
  const complexityScore = kernel.complexity / 10
  const attentionScore = kernel.attentionBudget
  const priorityScore = kernel.priority / 10
  const nodeScore = kernel.hypergraphNodes.length / 100
  
  return (complexityScore + attentionScore + priorityScore + nodeScore) / 4
}

/**
 * Get kernel statistics
 */
export function getKernelStats(kernels: CognitiveKernel[]): {
  totalKernels: number
  averageComplexity: number
  averageAttention: number
  averagePriority: number
  typeDistribution: Record<string, number>
  mostImportant: CognitiveKernel | null
} {
  if (kernels.length === 0) {
    return {
      totalKernels: 0,
      averageComplexity: 0,
      averageAttention: 0,
      averagePriority: 0,
      typeDistribution: {},
      mostImportant: null
    }
  }
  
  const totalComplexity = kernels.reduce((sum, k) => sum + k.complexity, 0)
  const totalAttention = kernels.reduce((sum, k) => sum + k.attentionBudget, 0)
  const totalPriority = kernels.reduce((sum, k) => sum + k.priority, 0)
  
  const typeDistribution: Record<string, number> = {}
  kernels.forEach(kernel => {
    typeDistribution[kernel.type] = (typeDistribution[kernel.type] || 0) + 1
  })
  
  const mostImportant = kernels.reduce((max, kernel) => 
    calculateKernelImportance(kernel) > calculateKernelImportance(max) ? kernel : max
  )
  
  return {
    totalKernels: kernels.length,
    averageComplexity: totalComplexity / kernels.length,
    averageAttention: totalAttention / kernels.length,
    averagePriority: totalPriority / kernels.length,
    typeDistribution,
    mostImportant
  }
}