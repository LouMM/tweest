import React, { useRef } from 'react';
export interface Page {
  color: string;
}
window.onload = (event) => {
  onload(event);
}

const clientId: string = "[retrieveData]"
const redirect_uri: string = "http://localhost:3001";
const scope: string = encodeURIComponent("follows.read tweet.read offline.access");

const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let array = new Uint8Array(40);
window.crypto.getRandomValues(array);
array = array.map(x => validChars.charCodeAt(x % validChars.length));
var statearray = Array.from(array)
const randomState = String.fromCharCode.apply(null, statearray);
const state: string = randomState;
const authorizeUrl: string = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}&code_challenge=challenge&code_challenge_method=plain`;

export class App extends React.Component<Page, {}> {

  render() {

    const cardTitle = "Card 1";
    const cardTextContents = `The color of this page is: ${0}`

    return (
      <div className='pagecontainer'>
        <button onClick={click}>Login</button>
      </div>
    );
  }
}

async function onload(ev: Event) {
  // Extract Authorization Code
  // Get Access Token
  console.log("in onload function");
  const url = new URL(window.location.href);
  let code = url.searchParams.get('code');
  if (code != null) {
    await getAToken(code);
  }

}


async function getAToken(authCode: string) {

  const response = await fetch(`${redirect_uri}//login?auth=${authCode}`, {
    method: 'GET'
  });

  // Check for a successful response
  if (response.ok) {
    const data = await response.json();
    // Do something with the data here
    console.log(data);
  }
}
async function getAccessToken(authorizationCode: string) {

  const authCodeUrl: string = `https://api.twitter.com/2/oauth2/token?code=${authorizationCode}&grant_type=authorization_code&client_id=${clientId}&redirect_uri=${redirect_uri}&code_verifier=challenge`;

  const headerDict = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  const requestOptions = {
    headers: new Headers(headerDict),
  };
  const response = await fetch(authCodeUrl, {
    method: 'POST',
    body: "",
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
  });

  if (!response.ok) { /* Handle */ }

  const bodydata = await decodeBody(response.body);
  console.log(bodydata);
}
//y) React.DOMAttributes<HTMLButtonElement>.onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined
function click(x: React.MouseEvent<HTMLButtonElement> | undefined) {
  window.location.href = authorizeUrl;

}

async function decodeBody(stream: ReadableStream<Uint8Array> | null) {
  if (stream !== null) {
    const utf8Decoder = new TextDecoder("utf-8");
    // body is ReadableStream<Uint8Array>
    // parse as needed, e.g. reading directly, or
    let reader = stream.getReader();
    let { value: chunk, done: readerDone } = await reader.read();
    let asString = utf8Decoder.decode(chunk, { stream: true });
    const asJSON = JSON.parse(asString);  // implicitly 'any', make sure to verify type on runtime.
    return asJSON;
  }
  return null;
}

//https://api.twitter.com/2/users/19457582/followers?user.fields=created_at,description,id,name,profile_image_url,username,verified
export default App;