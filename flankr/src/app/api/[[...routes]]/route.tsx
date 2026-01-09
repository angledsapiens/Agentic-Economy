/** @jsxImportSource frog/jsx */
import { Button, Frog, TextInput } from 'frog';
import { handle } from 'frog/next';

const app = new Frog({
  basePath: '/api',
  title: 'Flankr Frame',
});

// Initial Frame
app.frame('/', (c) => {
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60, backgroundColor: 'black', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        Flankr
        <div style={{ fontSize: 30, marginTop: 20 }}>Liquidity Intents SDK</div>
      </div>
    ),
    intents: [
      <Button action="/guard">Enter Guard</Button>,
    ],
  })
});

// Guard Frame
app.frame('/guard', (c) => {
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 40, backgroundColor: '#18181b', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        Status: ONLINE
        <br />
        Treasury: $1,250.00
      </div>
    ),
    intents: [
      <Button action="/">Back</Button>,
      <Button.Link href="https://flankr.vercel.app">Launch Wingman</Button.Link>
    ],
  })
});

export const GET = handle(app);
export const POST = handle(app);
