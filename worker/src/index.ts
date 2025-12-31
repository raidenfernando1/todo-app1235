import { Hono } from 'hono';
import { poweredBy } from 'hono/powered-by';
import { cors } from 'hono/cors';
import { Bindings } from './types';

import Auth from './auth/login';

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
            <p>This is built using Cloudflare Workers and Hono for routing feel free to look at the code at <a href="https://github.com/raidenfernando1/todo-app1235">GITHUB</a> </p>
			<ul>
				<li>/health – Checks the service status and returns a basic health response to verify the API is running.</li>
				<li>/api – Provides access to the main API endpoints and returns application data.</li>
				<li>/auth – Handles authentication-related operations such as login, token management, and authorization.</li>
				<li>/auth/login - For oauth google login its the only way to login in to the app and logging in here would also log you in the app itself.</li>
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

export default entry;
