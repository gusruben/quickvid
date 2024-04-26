import express from "express";

const app = express();

const PORT = 3000;
const HOSTNAME = "0.0.0.0";

app.use(express.static("frontend"));

app.listen(PORT, HOSTNAME, () =>
	console.log(`QuickVid Running on http://${HOSTNAME}:${PORT}`)
);
