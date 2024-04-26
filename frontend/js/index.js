// Styling effects code
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