"use strict";
// const data = process.argv[0];
const data = require('./algo_complete_data');

const randomIntFromInterval = function(min,max,except) {
	const number = Math.floor(Math.random()*(max-min+1)+min);
    return (number === except) ? randomIntFromInterval(min,max,except) : number;
}
function isInvalidVector(vector) {
	let pos = 0;
	while(pos < vector.length-1 && vector[pos] === vector[pos+1] && (vector[pos] === false)) {
		pos++;
	}
	const isInvalid = pos === vector.length-1;
	return isInvalid;
}
function getResult(solution) {
	const result = [];
	for (var i = 0; i < solution.vector.length; i++) {
		if(solution.vector[i]) {
			result.push(data[i]);
		}
	}
	return result;
}

class Solution {
	constructor(vector, features) {
		this.cost = 9999;
		if(vector) this.vector = vector;
	}
	random(length) {
		const vector = [];
		for (var j = 0; j < length; j++) {
			vector.push(Math.random() >= 0.5);
		}
		if(isInvalidVector(vector)) {
			this.random(length);
		} else {
			this.vector = vector;
		}
	}
	calcCost() {
		const browsers = [];
		let impact = 0;
		for (var i = 0; i < this.vector.length; i++) {
			if(this.vector[i]) {
				browsers.push.apply(browsers, data[i].missing);
				impact += ((data[i].impact || 1) * (data[i].count || 1));
			}
		}
		const allB = browsers.reduce((prev, current) => {
			if(!(current['nameVersion'] in prev.result)) {
				prev.result[current['nameVersion']] = current;
				prev.sum += current.share;
			}
			return prev;
		},{result: {}, sum: 0});
		const ende = impact / allB.sum;
		this.cost = ende
	}
	mutate() {
		if (Math.random() > 0.5) return;
		const index = randomIntFromInterval(0,this.vector.length-1);
		const newVector = [];
		for (var i = 0; i < this.vector.length; i++) {
			newVector.push(i === index ? !this.vector[i] : this.vector[i]);
		}
		if(isInvalidVector(newVector)) {
			this.mutate();
		} else {
			this.vector = newVector;
		}
	}
	crossover(parent2) {
		const pivot = randomIntFromInterval(1, this.vector.length - 2);
		const newV = this.vector.slice(0, pivot);
		const newV2 = parent2.slice(pivot, parent2.length);
		newV.push.apply(newV, newV2);
		if(isInvalidVector(newV)) {
			this.crossover(parent2);
		} else {
			this.vector = newV;
		}
	}
}


class Generation {

	constructor(solutionSpace, size) {
		this.population = [];
		this.generationNumber = 0;
		this.solLength = solutionSpace.length;
		this.size = size;
		this.elite = Math.round(0.2 * size);
		if(size) {
			while (size--) {
				var sol = new Solution();
				sol.random(this.solLength);
				this.population.push(sol);
			}
		}
		for (var i = 0; i < this.population.length; i++) {
			this.population[i].calcCost();
		}
		this.sort();
	}
	sort() {
		this.population.sort(function(a, b) {
			return a.cost - b.cost;
		});
	}
	display() {
		console.log(this);
	}
	nextGeneration() {

		const newGeneration = new Generation(data);
		const randomParentIndex1 = randomIntFromInterval(0, this.elite - 1);
		const randomParentIndex2 = randomIntFromInterval(0, this.elite - 1, randomParentIndex1);
		const randomParent1Mem = this.population[randomParentIndex1];
		const randomParent2Mem = this.population[randomParentIndex2];
		const randomParent1 = JSON.parse(JSON.stringify(randomParent1Mem.vector));
		const randomParent2 = JSON.parse(JSON.stringify(randomParent2Mem.vector));

		for (var i = 0; i < this.population.length; i++) {

			if(i < this.elite) {
				newGeneration.population.push(this.population[i]);
			} else {
				newGeneration.population.push(new Solution(randomParent1));
				if(Math.random() > 0.5) {
					// mutate
					newGeneration.population[i].mutate();
				} else {
					// crossover
					newGeneration.population[i].crossover(randomParent2);
				}

				newGeneration.population[i].calcCost();

			}
		}

		newGeneration.sort();
		newGeneration.generationNumber = this.generationNumber + 1;
		newGeneration.elite = this.elite;
		newGeneration.size = this.size;
		return newGeneration;
	}

}

var generation = new Generation(data, 10);
const result = {};
const resultArray = [];

for (var i = 0; i < 50; i++) {
	generation = generation.nextGeneration();
	for (var j = 0; j < generation.population.length; j++) {
		result[generation.population[j].cost] = generation.population[j];
	}
}

generation.display();
	
for (var k = 0; k < Object.keys(result).length; k++) {
	const key = Object.keys(result)[k];
	resultArray.push(result[key]);
}

console.log(getResult(resultArray.sort((a,b) => a.cost - b.cost)[0]));
// console.log(resultArray.sort((a,b) => b.cost - a.cost).map(elem => elem.cost));