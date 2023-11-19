import { writeFileSync } from "node:fs";

const baseUrl = "https://idleon.wiki/wiki/api.php";
const batchLimit = 500;
let params = {
	action: "query",
	format: "json",
	list: "allimages",
	ailimit: batchLimit.toString(),
};
const out = {};
const dump = [];
let batchNo = 0;
let latestHit = "";

async function fetchImages() {
	if (batchNo === 0) out.started = Date.now();
	batchNo++;
	console.log(`Fetching... (batch ${batchNo})`);

	let url = baseUrl + "?origin=*";
	Object.keys(params).forEach(function (key) {
		url += "&" + key + "=" + params[key];
	});

	await fetch(url)
		.then(function (response) {
			return response.json();
		})
		.then(function (response) {
			var images = response.query.allimages;
			images.forEach((img) => {
				dump.push({
					name: img.name,
					timestamp: img.timestamp,
					url: img.url,
				});

				latestHit = img.name;
			});
		})
		.catch(function (error) {
			console.log(error);
		});
}

while (dump.length % batchLimit === 0) {
	if (batchNo > 0) params.aifrom = latestHit;
	await fetchImages();
}
out.finished = Date.now();
out.dump = dump;

console.log(`Found ${dump.length} images!`);
writeFileSync("dump.json", JSON.stringify(out, null, 2));
console.log(`Dumped ${dump.length} images!`);
