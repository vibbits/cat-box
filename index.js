import { OAuth2Client } from "google-auth-library";
import http from "http";
import url from "url";
import open from "open";
import destroyer from "server-destroy";
import dotenv from 'dotenv';

dotenv.config();
const keys = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

const VIDEO_ID = "xbXZFoAqO2E";

const main = async () => {
  const oAuth2Client = await getAuthenticatedClient();
  const listVideos =
    await oAuth2Client.request({url: `https://youtube.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${VIDEO_ID}`});
  listVideos.data.items.forEach(async (v) => {
    const lid = v.liveStreamingDetails.activeLiveChatId;
    console.log(v.liveStreamingDetails.activeLiveChatId);
    const chat = await oAuth2Client.request({
      url: `https://youtube.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${lid}&part=snippet%2CauthorDetails`,
    });
    console.log(chat.data.items);

    await oAuth2Client.request({
      url: "https://youtube.googleapis.com/youtube/v3/liveChat/messages?part=snippet",
      method: "POST",
      data: {
        snippet: {
          liveChatId: lid,
          type: "textMessageEvent",
          textMessageDetails: {
            messageText: "Hello, I am a bot",
          },
        },
      },
    });
  })

  if (false) {
  const url =
    // "https://youtube.googleapis.com/youtube/v3/liveBroadcasts?part=snippet%2Cstatus&mine=true";
    // 6avAha_GoBQ broadcast ID 
    "https://youtube.googleapis.com/youtube/v3/liveBroadcasts?part=snippet%2Cstatus&id=jjdKjfzRfP8"; 
  const res = await oAuth2Client.request({ url });
  console.log(res.data);
  res.data.items
    .filter((item) => item.status.lifeCycleStatus === "live")
    .map((item) => item.snippet.liveChatId)
    .forEach(async (lid) => {
      const chat = await oAuth2Client.request({
        url: `https://youtube.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${lid}&part=snippet%2CauthorDetails`,
      });
      console.log(chat.data.items);

      await oAuth2Client.request({
        url: "https://youtube.googleapis.com/youtube/v3/liveChat/messages?part=snippet",
        method: "POST",
        data: {
          snippet: {
            liveChatId: lid,
            type: "textMessageEvent",
            textMessageDetails: {
              messageText: "Hello, I am a bot",
            },
          },
        },
      });
    });
  }
  //const tokenInfo = await oAuth2Client.getTokenInfo(
  //  oAuth2Client.credentials.access_token
  //);
  //console.log(tokenInfo);
};

const getAuthenticatedClient = async () => {
  const oAuth2Client = new OAuth2Client(
    keys.web.client_id,
    keys.web.client_secret,
    keys.web.redirect_uris[0]
  );

  const authorizeUrl = oAuth2Client.generateAuthUrl({
    scope: [
      "https://www.googleapis.com/auth/youtube",
      "https://www.googleapis.com/auth/youtube.force-ssl",
      "https://www.googleapis.com/auth/youtube.readonly",
    ],
  });

  return new Promise((resolve, reject) => {
    const server = http
      .createServer(async (req, res) => {
        try {
          if (req.url.indexOf("/oauth") > -1) {
            const qs = new url.URL(req.url, "http://localhost:50001")
              .searchParams;
            const code = qs.get("code");
            //console.log(`Code is ${code}`);
            res.end("Authentication successful! Please return to the console.");
            server.destroy();

            const r = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(r.tokens);
            //console.info("Tokens acquired.");
            resolve(oAuth2Client);
          }
        } catch (e) {
          reject(e);
        }
      })
      .listen(50001, () => {
        open(authorizeUrl, { wait: false }).then((cp) => cp.unref());
      });
    destroyer(server);
  });
};

main().catch(console.error);
