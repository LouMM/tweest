import path from 'path';
import express from 'express';
const PORT = process.env.PORT || 3001
const clientId: string = "V1M0eXR1WjRjVEhJeHhzUnRPbmM6MTpjaQ"
const redirect_uri: string = `http://localhost:${PORT}`;
const scope: string = encodeURIComponent("follows.read tweet.read offline.access");

const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const app = express(),
    DIST_DIR = __dirname,
    HTML_FILE = path.join(DIST_DIR, 'index.html')
app.use(express.static(DIST_DIR))
app.get('/', (req, res) => {
    res.sendFile(HTML_FILE)
})

// Defining get request at '/array' route
app.get('/login', async function (req, res) {
    const authorizationCode = req.query.auth as string;
    if(authorizationCode !== null)
        await getAccessToken(authorizationCode);
});

async function getAccessToken(authorizationCode: string):Promise<string>  {

    const authCodeUrl: string = `https://api.twitter.com/2/oauth2/token?code=${authorizationCode}&grant_type=authorization_code&client_id=${clientId}&redirect_uri=${redirect_uri}&code_verifier=challenge`;


    const response = await fetch(authCodeUrl, {
        method: 'POST',
        body: "",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Authorization':'' }
    });

    if (!response.ok) 
    {
        console.log(response.text);
        return response.body !== null ? decodeBody(response.body,true) : "";
    }
    console.log(decodeBody(response.body,true));
    console.log(response.url);
    return response.json()
  
}

app.listen(PORT, () => {
    console.log(`App listening to http://localhost:${PORT}`)
    console.log('Press Ctrl+C to quit.')
})


async function decodeBody(stream: ReadableStream<Uint8Array> | null, returnString?:boolean) {
    if (stream !== null) {
      const utf8Decoder = new TextDecoder("utf-8");
      // body is ReadableStream<Uint8Array>
      // parse as needed, e.g. reading directly, or
      let reader = stream.getReader();
      let { value: chunk, done: readerDone } = await reader.read();
        
      let asString = utf8Decoder.decode(chunk, { stream: true });
      if(returnString && returnString == true)
        return returnString;
      const asJSON = JSON.parse(asString);  // implicitly 'any', make sure to verify type on runtime.
      return asJSON;
    }
    return null;
  }