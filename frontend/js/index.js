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
	const res = await fetch("/summarize", {
		body: JSON.stringify({ url }),
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});
	return await res.json();
}

// page interactions
document.getElementById("summarize-button").addEventListener("click", async () => {
	document.getElementById("navbar-center").classList.add("invisible");
	document.getElementById("navbar").classList.remove("invisible");

	const url = document.getElementById("url-input").value;
	console.log(url);
	document.getElementById("loader").classList.remove("hidden")
	const { synopsis, summaryChunks } = await getSummary(url)
	document.getElementById("loader").classList.add("hidden")

	// load in text
	document.getElementById("synopsis").innerText = synopsis;
})

// document.getElementById("summarize-button").click()