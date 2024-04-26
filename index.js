import express from "express";
import { YoutubeTranscript } from "youtube-transcript";
import OpenAI from "openai";
import "dotenv/config";

const app = express();
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

const openai = new OpenAI(); // api key comes from .env (using dotenv)

const PORT = 3000;
const HOSTNAME = "0.0.0.0";

async function getTranscript(url) {
	const captions = await YoutubeTranscript.fetchTranscript(url);
	const transcript = captions.map(caption => caption.text).join(" ");
	return transcript;
}

app.post("/summarize", async (req, res) => {
	const url = req.body.url;
	if (!url) {
		res.status(400).send("URL is required");
		return;
	}

	const transcript = await getTranscript(url);

	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content:
					"Summarize the following video transcript. Output only the summary:",
			},
			{ role: "user", content: transcript },
		],
		model: "gpt-3.5-turbo",
	});
	console.log(completion.choices)

	res.send(completion.choices)
	// res.send(completion.data.choices[0].text);
});

app.use(express.static("frontend"));

app.listen(PORT, HOSTNAME, () =>
	console.log(`QuickVid Running on http://${HOSTNAME}:${PORT}`)
);
