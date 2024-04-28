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
	const summary = await res.text();
	return summary;
}

// page interactions
document.getElementById("summarize-button").addEventListener("click", async () => {
	document.getElementById("navbar-center").classList.add("hidden");
	document.getElementById("navbar").classList.remove("hidden");

	const url = document.getElementById("url-input").value;

})