const Graph = require('./Graph');
const GenderNode = require('./weight_nodes/GenderNode');
const RatingNode = require('./weight_nodes/RatingNode');
const YearNode = require('./weight_nodes/YearNode');

class MotherGraph extends Graph {
    constructor(movies = []) {
        super();
        this.genderGraph = new Graph();
        this.ratingGraph = new Graph();
        this.yearGraph = new Graph();
        this.movies = new Map();

        if (movies && movies.length > 0) {
            this.initializeGraphs(movies);
        }
    }

}


module.exports = MotherGraph;