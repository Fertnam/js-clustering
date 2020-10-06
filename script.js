window.addEventListener('load', () => {
	let form = document.querySelector('.form');
	let pointsInput = document.querySelector('.form__points-input');

	let chart = {};

	const CLUSTERS_COUNT = 3;
	const COLORS = ['red', 'blue', 'yellow'];

	//Событие при отправке формы
	form.addEventListener('submit', (event) => {
		event.preventDefault();

		let points = fillPoints(pointsInput.value);

		let clusters = [];
		let newClusters = [];

		let massCenters = [];
		let massCentersDistance = [];

		let iterationsCount = 0;

		while(true) {
			if (iterationsCount === 0) {
				massCenters = fillMassCenters(points);
				massCentersDistance = fillMassCentersDistance(massCenters, points);
			}

			if (newClusters.length !== 0) {
				clusters = newClusters
			} else {
				clusters = fillClusters(massCentersDistance, points);
			}

			massCenters = fillClusterMassCenters(clusters);

			massCentersDistance = fillMassCentersDistance(massCenters, clusters.flat());
			newClusters = fillClusters(massCentersDistance, clusters.flat());

			if (compareArrays(clusters, newClusters)) {
				iterationsCount++;
				break;
			}

			iterationsCount++;
		}

		renderChart(fillDatasets(newClusters))

		alert(`Выполнено за ${iterationsCount} итераций`);
	});

	//Заполнить наборы данных для графика
	function fillDatasets(clusters) {
		let result = [];

		clusters.forEach((cluster, index) => {
			result.push({
				label: 'Кластер #' + (index + 1),
				data: [],
				backgroundColor: COLORS[index]
			});

			cluster.forEach((point) => {
				result[index].data.push({ x: point.x, y: point.y, r: 8 })
			});
		});

		return result;
	}

	//Сравнить массивы
	function compareArrays(firstArray, secondArray) {
		let result = true;

		loop:
			for (let clusterIndex = 0; clusterIndex < firstArray.length; clusterIndex++) {
				for (let pointIndex = 0; pointIndex < firstArray[clusterIndex].length; pointIndex++) {
					if (
						firstArray[clusterIndex][pointIndex].x !== secondArray[clusterIndex][pointIndex].x
						||
						firstArray[clusterIndex][pointIndex].y !== secondArray[clusterIndex][pointIndex].y
					) {
						result = false;
						break loop;
					}
				}
			}

		return result;
	}

	//Сгенерировать точки
	function fillPoints(count) {
		let result = [];

		for(let i = 0; i < count; i++) {
			result.push({
				x: Math.random(),
				y: Math.random()
			})
		}

		return result;
	}

	//Вычислить центры масс
	function fillMassCenters(points) {
		let result = [];

		let index = 0;
		let busyPoints = [];

		while(index < CLUSTERS_COUNT) {
			let point = points[Math.floor(Math.random() * points.length)];

			if (!busyPoints.includes(point)) {
				result.push(point);
				busyPoints.push(point);

				index++;
			}
		}

		return result;
	}

	//Для каждой точки вычислить расстояние до каждого из центров масс
	function fillMassCentersDistance(massCenters, points) {
		let result = [];

		massCenters.forEach((massCenter, index) => {
			result.push([]);

			points.forEach((point) => {
				result[index].push(
					Math.sqrt(
						Math.pow(point.x - massCenter.x, 2) + Math.pow(point.y - massCenter.y, 2)
					)
				)
			});
		});

		return result;
	}

	//Распределим точки по кластерам
	function fillClusters(massCentersDistance, points) {
		let result = [];
		let pointsDistance = [];

		massCentersDistance.forEach((massCenterDistance, distanceIndex) => {
			result.push([]);

			massCenterDistance.forEach((clusterDistance, index) => {
				if (distanceIndex === 0) {
					pointsDistance.push([])
				}

				pointsDistance[index].push(clusterDistance);
			});
		});

		pointsDistance.forEach((distances, pointIndex) => {
			let minValue = 1;
			let clusterNumber = 0;

			distances.forEach((distance, index) => {
				if (distance < minValue) {
					minValue = distance;
					clusterNumber = index;
				}
			});

			result[clusterNumber].push(points[pointIndex]);
		});

		return result;
	}

	//Вычислить центры масс для кластеров
	function fillClusterMassCenters(clusters) {
		let result = [];

		clusters.forEach((clusterPoints) => {
			let sumX;
			let sumY;

			sumX = sumY = 0;

			clusterPoints.forEach((point) => {
				sumX += point.x;
				sumY += point.y;
			});

			let centerX = sumX / clusterPoints.length;
			let centerY = sumY / clusterPoints.length;

			result.push({
				x: centerX,
				y: centerY
			});
		});

		return result;
	}

	//Сгенерировать график
	function renderChart(datasets) {
		let canvas = document.querySelector('.graphic__canvas');

		if (Object.keys(chart).length !== 0) {
			chart.destroy();
		}

		chart = new Chart(canvas, {
			type: 'bubble',
			data: {
				datasets: datasets
			},
			options: {
				events: [ 'click' ]
			}
		});
	}
}, { once: true });