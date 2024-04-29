import express from "express";
import { YoutubeTranscript } from "youtube-transcript";
import OpenAI from "openai";
import "dotenv/config";
import axios from "axios";

const app = express();
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

const openai = new OpenAI(); // api key comes from .env (using dotenv)

const PORT = 3000;
const HOSTNAME = "0.0.0.0";

const SUMMARIZE_PROMPT =
	"Please provide a detailed summary of the YouTube video, explaining each \
step or key point in the process. The summary should cover all major aspects \
discussed in the video, including any demonstrations, examples, or techniques \
presented. Be sure to provide clear explanations for each part of the process.";
const CHUNK_PROMPT =
	"Summarize a specific 5-minute segment from the YouTube \
video with even more detail. Ensure you cover all key points, examples, and \
techniques discussed in this portion of the video. Provide thorough \
explanations for each step or concept introduced within this timeframe.";

/**
 * Generates text using gpt-3.5-turbo
 * @param {string} prompt The system prompt to give the GPT model
 * @param {string} text the text to operate on (the user input)
 * @param {Array} chatHistory the chat history to provide to the GPT model (optional)
 * @returns {Object} {response: string, chatHistory: Array}
 */
async function askGPT(prompt, text, chatHistory = []) {
	const messages = [
		...chatHistory,
		{ role: "system", content: prompt },
		{ role: "user", content: text },
	];

	const completion = await openai.chat.completions.create({
		model: "gpt-3.5-turbo",
		messages,
	});
	console.log(completion);

	const response = completion.choices[0].message;
	return {
		response: response.content,
		chatHistory: [...messages, response],
	};
}

/**
 * Gets the transcript of a YouTube video and breaks it into 5 minute chunks--[]
 * @param {string} url The URL or ID of the YouTube video
 * @returns {Object} {transcript: string, chunks: Array<string>}
 */
async function getTranscript(url) {
	const captions = await YoutubeTranscript.fetchTranscript(url);
	const fullTranscript = captions.map(caption => caption.text).join(" ");

	// break captions into 5 minute chunks to each be summmarized individually
	const chunkSize = 5 * 60;
	const chunks = [];
	captions.forEach((caption, i) => {
		// this will only add chunks once the next 5 minute mark is reached
		if (caption.offset > chunkSize * (chunks.length + 1)) {
			// add the chunk to the chunks list and remov it from the captions list
			chunks.push(captions.splice(0, i + 1));
		}
	});
	// add the last chunk
	chunks.push(captions);
	// extract the text from the chunks
	const textChunks = chunks.map(chunk => {
		return {
			start: chunk[0].offset,
			end: chunk[chunk.length - 1].offset,
			text: chunk.map(caption => caption.text).join(" "),
		};
	});

	return { transcript: fullTranscript, chunks: textChunks };
}

async function getVideoInfo(url) {
	const regExp =
		/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/;
	const ytVideoID = url.match(regExp)[1];
	const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ytVideoID}&key=${process.env.YOUTUBE_API_KEY}`;

	const response = await axios.get(endpoint);
	const data = response.data;
	const title = data.items[0].snippet.title;
	return {
		title,
		data,
	};
}

app.post("/summarize", async (req, res) => {
	const url = req.body.url;
	if (!url) {
		res.status(400).send("URL is required");
		return;
	}

	const info = await getVideoInfo(url);

	console.log(`Recieved summary request for ${url}`);

	const { transcript, chunks } = await getTranscript(url);

	const { response: synopsis, chatHistory } = await askGPT(SUMMARIZE_PROMPT, transcript);
	// get a summary for each chunk
	const summaryChunks = await Promise.all(
		chunks
			.map(async chunk => (await askGPT(CHUNK_PROMPT, chunk.text, chatHistory)).response)
			.map(async prom => await prom)
	);
	const summaryChunksWithTimestamps = chunks.map((chunk, i) => {
		return {
			start: chunk.start,
			end: chunk.end,
			summary: summaryChunks[i],
		};
	});

	console.log("DONE")
	console.log(summaryChunksWithTimestamps)

	res.send({ synopsis, summaryChunks: summaryChunksWithTimestamps, title: info.title, info: info.data });
	// res.send({chatHistory})
});

app.use(express.static("frontend"));

app.listen(PORT, HOSTNAME, () => console.log(`QuickVid Running on http://${HOSTNAME}:${PORT}`));
