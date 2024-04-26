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

const SUMMARIZE_PROMPT =
	"Please provide a detailed summary of the YouTube \
video, explaining each step or key point in the process. The summary should \
cover all major aspects discussed in the video, including any demonstrations, \
examples, or techniques presented. Be sure to provide clear explanations for each \
part of the process.";

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

	console.log(`Recieved summary request for ${url}`)

	const transcript = await getTranscript(url);

	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: SUMMARIZE_PROMPT,
			},
			{ role: "user", content: transcript },
		],
		model: "gpt-3.5-turbo",
	});

	console.log(completion.choices)
	const summary = completion.choices[0].message.content;
	res.send(summary);
});

app.use(express.static("frontend"));

app.listen(PORT, HOSTNAME, () =>
	console.log(`QuickVid Running on http://${HOSTNAME}:${PORT}`)
);
