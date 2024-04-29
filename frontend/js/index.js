// Styling effects
const glowBall = document.getElementById("glow-ball");
const glowBallRadius = glowBall.offsetWidth / 2;

document.addEventListener("mousemove", e => {
	glowBall.style.left = e.pageX - glowBallRadius + "px";
	glowBall.style.top = e.pageY - glowBallRadius + "px";
});

// trigger mousemove on page load to update glow position
document.addEventListener("DOMContentLoaded", () => {
	document.dispatchEvent(new Event("mousemove"));
});

async function getSummary(url) {
	// const res = await fetch("/summarize", {
	// 	body: JSON.stringify({ url }),
	// 	method: "POST",
	// 	headers: {
	// 		"Content-Type": "application/json",
	// 	},
	// });
	// return await res.json();
	const res = await axios.post("/summarize", { url }, {
		headers: {
			"Content-Type": "application/json"
		},
		timeout: 30000,
	});
	return res.data;
}

// page interactions
async function summarize() {
	const url = document.getElementById("url-input-center").value || document.getElementById("url-input").value;
	console.log(url);
	document.getElementById("url-input-center").value = ""
	document.getElementById("url-input").value = url;


	document.getElementById("navbar-center").classList.add("invisible");
	document.getElementById("navbar").classList.remove("invisible");

	document.getElementById("loader").classList.remove("hidden");
	const { synopsis, summaryChunks, title } = await getSummary(url);
	document.getElementById("loader").classList.add("hidden");

	// load in text
	document.getElementById("video-title").innerText = title;
	document.getElementById("video-url").innerText = url;
	document.getElementById("video-url").href = url;
	document.getElementById("video-synopsis").innerText = synopsis;
	const templateChunk = document.getElementById("template-chunk")
	summaryChunks.forEach((chunk, i) => {
		const elem = templateChunk.cloneNode(true);
		elem.id = ""
		elem.style="";
		elem.getElementsByClassName("chunk-summary")[0].innerText = chunk.summary;
		elem.getElementsByClassName("chunk-timestamp")[0].innerText = `${chunk.start} - ${chunk.end}`;
		elem.getElementsByClassName("chunk-title")[0].innerText = `Section ${i+1}`;
		document.getElementById("video-chunks").appendChild(elem)
	})
	document.getElementById("main").classList.remove("hidden")
}

document.getElementById("summarize-button").addEventListener("click", summarize);
document.getElementById("summarize-button-center").addEventListener("click", summarize);

// document.getElementById("summarize-button").click()
