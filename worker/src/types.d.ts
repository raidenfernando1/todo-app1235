export type Bindings = {
	DB: D1Database;
	COOKIE_SIGN_SECRET: string;
	USER_DATA_HASHSALT: string;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: STRING;
};

export type USER_SESSION_TYPE = {
	username: string;
	user_email: string;
	user_google_id: string;
	user_id: string;
};
