class Graph {
    constructor() {
        this.adjacencyList = new Map();
        this.nodeData = new Map();
    }

    addNode(node, data = null) {
        if (!this.adjacencyList.has(node)) {
            this.adjacencyList.set(node, new Map());
        }
        if (data !== null) {
            this.nodeData.set(node, data);
        }
        return this;
    }

    addEdge(node1, node2, weight = 1) {
        this.addNode(node1);
        this.addNode(node2);

        this.adjacencyList.get(node1).set(node2, weight);
        this.adjacencyList.get(node2).set(node1, weight);

        return this;
    }

    getNeighbors(node) {
        return this.adjacencyList.has(node)
            ? Array.from(this.adjacencyList.get(node).entries())
            : [];
    }

    hasEdge(node1, node2) {
        return this.adjacencyList.has(node1) &&
            this.adjacencyList.get(node1).has(node2);
    }

    getWeight(node1, node2) {
        if (this.hasEdge(node1, node2)) {
            return this.adjacencyList.get(node1).get(node2);
        }
        return null;
    }

    getAllNodes() {
        return Array.from(this.adjacencyList.keys());
    }

    getNodeData(node) {
        return this.nodeData.get(node) || null;
    }

    hasNode(node) {
        return this.adjacencyList.has(node);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Graph;
}