import type { Hypergraph, HypergraphNode } from './types.js'

/**
 * Implementation of a Hypergraph data structure
 * 
 * Inspired by OpenCog's AtomSpace, this provides a foundation for
 * storing and manipulating cognitive data structures as hypergraph patterns.
 */
export class CognitiveHypergraph implements Hypergraph {
  nodes: Map<string, HypergraphNode> = new Map()

  addNode(node: HypergraphNode): void {
    this.nodes.set(node.id, { ...node })
  }

  removeNode(id: string): void {
    const node = this.nodes.get(id)
    if (!node) return

    // Remove all links to this node
    for (const incomingId of node.incoming) {
      this.removeLink(incomingId, id)
    }
    for (const outgoingId of node.outgoing) {
      this.removeLink(id, outgoingId)
    }

    this.nodes.delete(id)
  }

  addLink(from: string, to: string): void {
    const fromNode = this.nodes.get(from)
    const toNode = this.nodes.get(to)
    
    if (!fromNode || !toNode) {
      throw new Error(`Cannot create link: node ${from} or ${to} not found`)
    }

    // Add outgoing link from source
    if (!fromNode.outgoing.includes(to)) {
      fromNode.outgoing.push(to)
    }

    // Add incoming link to target
    if (!toNode.incoming.includes(from)) {
      toNode.incoming.push(from)
    }
  }

  removeLink(from: string, to: string): void {
    const fromNode = this.nodes.get(from)
    const toNode = this.nodes.get(to)
    
    if (fromNode) {
      fromNode.outgoing = fromNode.outgoing.filter(id => id !== to)
    }
    
    if (toNode) {
      toNode.incoming = toNode.incoming.filter(id => id !== from)
    }
  }

  getNode(id: string): HypergraphNode | undefined {
    return this.nodes.get(id)
  }

  getIncoming(id: string): HypergraphNode[] {
    const node = this.nodes.get(id)
    if (!node) return []
    
    return node.incoming
      .map(incomingId => this.nodes.get(incomingId))
      .filter((n): n is HypergraphNode => n !== undefined)
  }

  getOutgoing(id: string): HypergraphNode[] {
    const node = this.nodes.get(id)
    if (!node) return []
    
    return node.outgoing
      .map(outgoingId => this.nodes.get(outgoingId))
      .filter((n): n is HypergraphNode => n !== undefined)
  }

  query(pattern: Record<string, unknown>): HypergraphNode[] {
    const results: HypergraphNode[] = []
    
    for (const node of this.nodes.values()) {
      if (this.matchesPattern(node, pattern)) {
        results.push(node)
      }
    }
    
    return results
  }

  traverse(startId: string, maxDepth: number): HypergraphNode[] {
    const visited = new Set<string>()
    const result: HypergraphNode[] = []
    
    const dfs = (nodeId: string, depth: number) => {
      if (depth > maxDepth || visited.has(nodeId)) {
        return
      }
      
      const node = this.nodes.get(nodeId)
      if (!node) return
      
      visited.add(nodeId)
      result.push(node)
      
      // Traverse outgoing links
      for (const outgoingId of node.outgoing) {
        dfs(outgoingId, depth + 1)
      }
    }
    
    dfs(startId, 0)
    return result
  }

  /**
   * Pattern matching for hypergraph nodes
   */
  private matchesPattern(node: HypergraphNode, pattern: Record<string, unknown>): boolean {
    // Match by type
    if (pattern.type && node.type !== pattern.type) {
      return false
    }
    
    // Match by truth value constraints
    if (pattern.truthValue && typeof pattern.truthValue === 'object') {
      const tv = pattern.truthValue as Record<string, unknown>
      if (tv.minStrength && node.truthValue.strength < (tv.minStrength as number)) {
        return false
      }
      if (tv.maxStrength && node.truthValue.strength > (tv.maxStrength as number)) {
        return false
      }
      if (tv.minUncertainty && node.truthValue.uncertainty < (tv.minUncertainty as number)) {
        return false
      }
      if (tv.maxUncertainty && node.truthValue.uncertainty > (tv.maxUncertainty as number)) {
        return false
      }
    }
    
    // Match by attention value constraints
    if (pattern.attentionValue && typeof pattern.attentionValue === 'object') {
      const av = pattern.attentionValue as Record<string, unknown>
      if (av.minSTI && node.attentionValue.shortTermImportance < (av.minSTI as number)) {
        return false
      }
      if (av.maxSTI && node.attentionValue.shortTermImportance > (av.maxSTI as number)) {
        return false
      }
      if (av.minLTI && node.attentionValue.longTermImportance < (av.minLTI as number)) {
        return false
      }
      if (av.maxLTI && node.attentionValue.longTermImportance > (av.maxLTI as number)) {
        return false
      }
    }
    
    // Match by metadata
    if (pattern.metadata && typeof pattern.metadata === 'object') {
      const metadata = pattern.metadata as Record<string, unknown>
      for (const [key, value] of Object.entries(metadata)) {
        if (node.metadata[key] !== value) {
          return false
        }
      }
    }
    
    // Match by connectivity constraints
    if (pattern.hasIncoming && node.incoming.length === 0) {
      return false
    }
    if (pattern.hasOutgoing && node.outgoing.length === 0) {
      return false
    }
    if (pattern.minIncoming && node.incoming.length < (pattern.minIncoming as number)) {
      return false
    }
    if (pattern.maxIncoming && node.incoming.length > (pattern.maxIncoming as number)) {
      return false
    }
    if (pattern.minOutgoing && node.outgoing.length < (pattern.minOutgoing as number)) {
      return false
    }
    if (pattern.maxOutgoing && node.outgoing.length > (pattern.maxOutgoing as number)) {
      return false
    }
    
    return true
  }

  /**
   * Calculate importance of a node based on connectivity and attention
   */
  getImportance(id: string): number {
    const node = this.nodes.get(id)
    if (!node) return 0
    
    const connectivityScore = (node.incoming.length + node.outgoing.length) / 10
    const attentionScore = node.attentionValue.shortTermImportance
    const truthScore = node.truthValue.strength * (1 - node.truthValue.uncertainty)
    
    return (connectivityScore + attentionScore + truthScore) / 3
  }

  /**
   * Get the most important nodes in the hypergraph
   */
  getMostImportant(count: number = 10): HypergraphNode[] {
    const nodes = Array.from(this.nodes.values())
    return nodes
      .sort((a, b) => this.getImportance(b.id) - this.getImportance(a.id))
      .slice(0, count)
  }

  /**
   * Spread activation through the hypergraph
   */
  spreadActivation(startId: string, activation: number, maxDepth: number = 3): Map<string, number> {
    const activations = new Map<string, number>()
    const visited = new Set<string>()
    
    const spread = (nodeId: string, currentActivation: number, depth: number) => {
      if (depth > maxDepth || visited.has(nodeId) || currentActivation < 0.01) {
        return
      }
      
      const node = this.nodes.get(nodeId)
      if (!node) return
      
      visited.add(nodeId)
      activations.set(nodeId, (activations.get(nodeId) || 0) + currentActivation)
      
      // Spread to connected nodes with decay
      const decayFactor = 0.7
      const spreadActivation = currentActivation * decayFactor
      
      for (const outgoingId of node.outgoing) {
        spread(outgoingId, spreadActivation, depth + 1)
      }
      
      for (const incomingId of node.incoming) {
        spread(incomingId, spreadActivation, depth + 1)
      }
    }
    
    spread(startId, activation, 0)
    return activations
  }

  /**
   * Get statistics about the hypergraph
   */
  getStats(): {
    nodeCount: number
    linkCount: number
    avgConnectivity: number
    mostConnected: string | null
    avgTruthValue: number
    avgAttention: number
  } {
    const nodes = Array.from(this.nodes.values())
    const nodeCount = nodes.length
    
    if (nodeCount === 0) {
      return {
        nodeCount: 0,
        linkCount: 0,
        avgConnectivity: 0,
        mostConnected: null,
        avgTruthValue: 0,
        avgAttention: 0
      }
    }
    
    const linkCount = nodes.reduce((sum, node) => sum + node.outgoing.length, 0)
    const avgConnectivity = linkCount / nodeCount
    
    const mostConnected = nodes.reduce((max, node) => 
      (node.incoming.length + node.outgoing.length) > 
      (max.incoming.length + max.outgoing.length) ? node : max
    )
    
    const avgTruthValue = nodes.reduce((sum, node) => sum + node.truthValue.strength, 0) / nodeCount
    const avgAttention = nodes.reduce((sum, node) => sum + node.attentionValue.shortTermImportance, 0) / nodeCount
    
    return {
      nodeCount,
      linkCount,
      avgConnectivity,
      mostConnected: mostConnected.id,
      avgTruthValue,
      avgAttention
    }
  }
}

/**
 * Factory function to create a new hypergraph
 */
export function createHypergraph(): Hypergraph {
  return new CognitiveHypergraph()
}