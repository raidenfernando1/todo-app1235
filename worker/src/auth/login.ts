import { googleAuth } from '@hono/oauth-providers/google';
import { Hono } from 'hono';
import { Bindings } from '../types';

const Auth = new Hono<{ Bindings: Bindings }>();

Auth.use('/login', async (c, next) => {
	try {
		return await googleAuth({
			client_id: c.env.GOOGLE_CLIENT_ID,
			client_secret: c.env.GOOGLE_CLIENT_SECRET,
			scope: ['openid', 'email', 'profile'],
		})(c, next);
	} catch (error) {
		console.error('OAuth middleware error:', error);
		return c.json({ error: 'Authentication failed' }, 401);
	}
});

Auth.get('/login', async (c) => {
	const token = c.get('token');
	const grantedScopes = c.get('granted-scopes');
	const user = c.get('user-google');

	if (!user || !token) {
		return c.json({ error: 'Authentication failed' }, 401);
	}

	try {
		const isExisting = await c.env.DB.prepare('SELECT * FROM users WHERE user_google_id = ?').bind(user.id).first();

		if (!isExisting) {
			const generatedUserID = crypto.randomUUID();

			await c.env.DB.prepare('INSERT INTO users (user_id, user_email, user_google_id) VALUES (?, ?, ?)')
				.bind(generatedUserID, user.email, user.id)
				.run();
		}

		return c.text('exists');
	} catch (error) {
		console.error('Database error:', error);
		return c.json({ error: 'Failed to save user' }, 500);
	}

	return c.json({
		token,
		grantedScopes,
		user,
	});
});

export default Auth;
