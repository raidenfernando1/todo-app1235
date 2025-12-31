import { googleAuth } from '@hono/oauth-providers/google';
import { Hono } from 'hono';
import { Bindings } from '../types';
import { setSignedCookie } from 'hono/cookie';

const Auth = new Hono<{ Bindings: Bindings }>();

const generatedUserID = async ({ id, salt }: { id: string; salt: string }): Promise<string> => {
	const encode = new TextEncoder();
	const encodedUserID = encode.encode(id + salt);
	const hash = await crypto.subtle.digest('SHA-256', encodedUserID);
	return Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
};

Auth.use('/login', async (c, next) => {
	try {
		return await googleAuth({
			client_id: c.env.GOOGLE_CLIENT_ID,
			client_secret: c.env.GOOGLE_CLIENT_SECRET,
			scope: ['openid', 'email', 'profile'],
		})(c, next);
	} catch (error) {
		return c.json({ error: 'Authentication failed' }, 401);
	}
});

Auth.get('/login', async (c) => {
	const token = c.get('token');
	const user = c.get('user-google');

	if (!user || !token) {
		return c.json({ error: 'Authentication failed' }, 401);
	}

	try {
		const isExisting = await c.env.DB.prepare('SELECT * FROM users WHERE user_email = ?').bind(user.email).first();

		if (!isExisting) {
			await c.env.DB.prepare('INSERT INTO users (user_id, user_email, user_google_id) VALUES (?, ?, ?)')
				.bind(
					await generatedUserID({
						id: user.id as string,
						salt: c.env.USER_DATA_HASHSALT as string,
					}),
					user.email,
					user.id
				)
				.run();
		}

		const userData = {
			email: user.email,
			name: user.name,
			isVerified: user.verified_email,
		};

		setSignedCookie(c, 'user_session', JSON.stringify(userData), c.env.COOKIE_SIGN_SECRET, {
			httpOnly: true,
			secure: true,
			sameSite: 'Strict',
			maxAge: 60 * 10,
		});

		return c.json({
			success: true,
			userData,
		});
	} catch (error) {
		console.error(error);

		if (error instanceof Error) {
			return c.json(
				{
					success: false,
					error: error.message,
				},
				500
			);
		}

		return c.json(
			{
				success: false,
				error: String(error),
			},
			500
		);
	}
});

export default Auth;
