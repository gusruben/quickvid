import express from "express";
import { YoutubeTranscript } from "youtube-transcript";

const app = express();
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

const PORT = 3000;
const HOSTNAME = "0.0.0.0";

app.post("/transcript", async (req, res) => {
	console.log(req.body);
	const captions = await YoutubeTranscript.fetchTranscript(req.body.url);
	res.send(captions);
});

app.use(express.static("frontend"));

app.listen(PORT, HOSTNAME, () =>
	console.log(`QuickVid Running on http://${HOSTNAME}:${PORT}`)
);
