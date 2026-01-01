import { googleAuth } from '@hono/oauth-providers/google';
import { Hono } from 'hono';
import { Bindings } from '../types';
import { getSignedCookie, setSignedCookie } from 'hono/cookie';

const Auth = new Hono<{ Bindings: Bindings }>();

export const IDLE_TIME_REFRESH = 14 * 24 * 60 * 60; // 2 weeks

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
		const isUserExist = async () => {
			const fetchUser = await c.env.DB.prepare('SELECT * FROM users WHERE user_email = ?').bind(user.email).first();
			if (!fetchUser) {
				try {
					const createUser = await c.env.DB.prepare(
						'INSERT INTO users (user_id, user_email, user_google_id) VALUES (?, ?, ?) RETURNING user_id, user_email, username, user_google_id;'
					)
						.bind(
							await generatedUserID({
								id: user.id as string,
								salt: c.env.USER_DATA_HASHSALT as string,
							}),
							user.email,
							user.id
						)
						.first();
					return createUser;
				} catch (error) {
					return c.json({
						error: 'error creating user',
						message: error,
					});
				}
			}
			return fetchUser;
		};
		const loggedInUser = await isUserExist();
		await setSignedCookie(c, 'user_session', JSON.stringify(loggedInUser), c.env.COOKIE_SIGN_SECRET, {
			httpOnly: true,
			secure: true,
			sameSite: 'Strict',
			maxAge: IDLE_TIME_REFRESH,
		});
		return c.json({
			success: true,
			loggedInUser,
		});
	} catch (error) {
		return c.json(
			{
				success: false,
				userData: {},
			},
			500
		);
	}
});

export default Auth;
