import { Hono } from 'hono';
import { poweredBy } from 'hono/powered-by';
import { cors } from 'hono/cors';
import { Bindings } from './types';

import Auth from './auth/login';

import DBTest from './routes/test';

const entry = new Hono<{ Bindings: Bindings }>();

entry.use('*', cors());
entry.use('*', poweredBy());

entry.get('/', (c) =>
	c.html(String.raw`
		<html>
      	<head>
        <style>
		body {
			padding: 0;
			margin: 0;	
			box-sizing: border-box;
		}

		.container {
			padding: 1rem;
			height: 100vh;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			box-sizing: border-box;
		}


		.art {
			padding: 0;
			font-size: 0.8rem;
			font-family: monospace;
		}
        </style>
      </head>
      <body>
        <div class="container">
          <div>
            <p>todo-app1235 api layer | contact: raidenfernando2@gmail.com for more information</p>
            <hr/>
            <p>Publicly available list of usable commands</p>
            <ul>
              <li>/health for api health</li>
              <li>/api for api data</li>
            </ul>
          </div>
          <pre class="art">
  ,ad8888ba,   88888888ba       88  888888888888  888888888888  88888888888  88888888ba   
d8"'    \`"8b  88      "8b    ,d88       88            88       88           88      "8b  
d8'            88      ,8P  888888       88            88       88           88      ,8P  
88             88aaaaaa8P'      88       88            88       88aaaaa      88aaaaaa8P'  
88             88""""88'        88       88            88       88"""""      88""""88'    
Y8,            88    \`8b       88       88            88       88           88    \`8b    
Y8a.    .a8P   88     \`8b      88       88            88       88           88     \`8b   
\`"Y8888Y"'    88      \`8b     88       88            88       88888888888  88      \`8b  
          </pre>
        </div>
      </body>
    </html>
  `)
);

entry.route('/auth', Auth);

entry.get('/health', async (c) => {
	return c.json({
		status: 'ok',
	});
});

entry.route('/test', DBTest);

export default entry;
