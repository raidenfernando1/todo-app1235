import { Hono } from 'hono';
import { Bindings } from '..';

const DBTest = new Hono<{ Bindings: Bindings }>();

DBTest.get('/', async (c) => {
	const columns = await c.env.DB.prepare('PRAGMA table_info(users)').all();
	return c.json(columns);
});

export default DBTest;
