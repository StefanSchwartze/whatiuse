"use strict";
let inputData = '';

process.stdin.on('data', chunk => inputData += chunk);
process.stdin.on('end', (chunk) => {

	const data = JSON.parse(inputData);

	const randomIntFromInterval = (min,max,except) => {
		const number = Math.floor(Math.random()*(max-min+1)+min);
	    return (number === except) ? randomIntFromInterval(min,max,except) : number;
	}
	const isInvalidVector = (vector) => {
		let pos = 0;
		while(pos < vector.length-1 && vector[pos] === vector[pos+1] && (vector[pos] === false)) {
			pos++;
		}
		return pos === vector.length-1;
	}
	const getResult = (solution) => {
		const result = [];
		for (var i = 0; i < solution.vector.length; i++) {
			if(solution.vector[i]) {
				result.push(data[i]);
			}
		}
		return {
			title: result.map(feature => feature.title).join(', '),
			collection: result,
			gained_share: solution.gained_share,
			cost: solution.cost,
			kicked_browsers: solution.kicked_browsers
		};
	}
	class Solution {
		constructor(vector, features) {
			this.cost = 9999;
			this.gained_share = 0;
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
			let impact = 0;
			let sum = 0;
			const kicked_browsers = [];
			const localBrowserCopy = JSON.parse(JSON.stringify(allBrowsers));

			for (var i = 0; i < this.vector.length; i++) {
				if(this.vector[i]) {
					impact += ((data[i].impact || 1) * (data[i].count || 1));
					const b = data[i].missing;
					for (var p = 0; p < b.length; p++) {
						localBrowserCopy[b[p].nameVersion].unsupportedCount -= 1;
					}
				}
			}

			for (var k = 0; k < Object.keys(localBrowserCopy).length; k++) {
				const key = Object.keys(localBrowserCopy)[k];
				if(localBrowserCopy[key].unsupportedCount < 1) {
					sum += localBrowserCopy[key].share;
					kicked_browsers.push(localBrowserCopy[key]);
				}
			}

			this.cost = impact / sum;
			this.gained_share = sum;
			this.kicked_browsers = kicked_browsers;
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
			const randomParent1 = randomParent1Mem.vector;
			const randomParent2 = randomParent2Mem.vector;

			for (var i = 0; i < this.population.length; i++) {
				if(i < this.elite) {
					newGeneration.population.push(this.population[i]);
				} else {
					newGeneration.population.push(new Solution(randomParent1));
					if(Math.random() > 0.6) {
						newGeneration.population[i].mutate();
					} else {
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

	const allBrowsers = data.reduce((prev, current, index, array) => {
		for (var i = 0; i < current.missing.length; i++) {
			const curr = current.missing[i].nameVersion;
			if(!prev[curr]) {
				prev[curr] = {
					nameVersion: current.missing[i].nameVersion,
					share: current.missing[i].share,
					unsupportedCount: 1
				}
			} else {
				prev[curr].unsupportedCount += 1;
			}
		}
		return prev;
	},{});

	var generation = new Generation(data, 10);
	const result = {};
	const resultArray = [];

	for (var i = 0; i < 500; i++) {
		generation = generation.nextGeneration();
		for (var j = 0; j < generation.population.length; j++) {
			result[generation.population[j].cost] = generation.population[j];
		}
	}
		
	for (var k = 0; k < Object.keys(result).length; k++) {
		const key = Object.keys(result)[k];
		resultArray.push(result[key]);
	}

	// console.log(getResult(resultArray.sort((a,b) => a.cost - b.cost)[0]));
	// console.log(resultArray.sort((a,b) => b.cost - a.cost).map(el => getResult(el)));
	const resss = resultArray.sort((a,b) => b.cost - a.cost).map(el => getResult(el));
	//console.log(resultArray.sort((a,b) => b.cost - a.cost));

	console.log(JSON.stringify(resss));
});