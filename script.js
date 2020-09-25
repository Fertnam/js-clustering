window.addEventListener('load', () => {
	let form = document.querySelector('.form');
	let pointsInput = document.querySelector('.form__points-input');

	let chart = null;

	const CLUSTERS_COUNT = 3;
	const COLORS = ['red', 'blue', 'yellow'];

	//Событие при отправке формы
	form.addEventListener('submit', (event) => {
		event.preventDefault();

		let points = fillPoints(pointsInput.value);
		let clusters = [];

		while (true) {
			let massCenters = fillMassCenters(points);
			let massCentersDistance = fillMassCentersDistance(massCenters, points);

			clusters = fillClusters(massCentersDistance, points);
			let clusterMassCenters = fillClusterMassCenters(clusters);

			let newMassCentersDistance = fillMassCentersDistance(clusterMassCenters, clusters.flat());
			let newClusters = fillClusters(newMassCentersDistance, clusters.flat());

			if (JSON.stringify(clusters) === JSON.stringify(newClusters)) {
				break;
			}
		}

		let datasets = [];

		clusters.forEach((cluster, index) => {
			datasets.push({
				label: 'Кластер #' + (index + 1),
				data: [],
				backgroundColor: COLORS[index]
			});

			cluster.forEach((point) => {
				datasets[index].data.push({ x: point.x, y: point.y, r: 8 })
			});
		});

		updateChart(datasets);
	});

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

	//Обновить график
	function updateChart(datasets) {
		let canvas = document.querySelector('.graphic__canvas');

		if (chart !== null) {
			chart.destroy();
		}

		chart = new Chart(canvas, {
			type: 'bubble',
			data: {
				datasets: datasets
			}
		});
	}
}, { once: true });