const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const twilio = require("twilio");
const downloadInstagramVideo = require("./utils/instagramDownloader");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.post("/webhook", async (req, res) => {
  const incomingMessage = req.body.Body;
  const sender = req.body.From;
  console.log(`Received message from ${sender}: ${incomingMessage}`);

  if (!incomingMessage) {
    return res.send("Please send a valid Instagram video link.");
  }

  if (incomingMessage.includes("instagram.com")) {
    const videoUrl = await downloadInstagramVideo(incomingMessage);

    if (!videoUrl) {
      return res.send("Failed to fetch video. Try again later.");
    }

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: sender,
      body: "Here is your Instagram video 🎥",
      mediaUrl: [videoUrl],
    });

    return res.send("Video sent successfully!");
  } else {
    res.send("Please send a valid Instagram video link.");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
