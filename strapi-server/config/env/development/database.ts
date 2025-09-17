export default ({ env }) => ({
	connection: {
		client: 'postgres',
		connection: {
		host: env('DATABASE_HOST', 'localhost'),
			port: env.int('DATABASE_PORT', 5433),
			database: env('DATABASE_NAME', 'strapi'),
			user: env('DATABASE_USERNAME', 'strapi'),
			password: env('DATABASE_PASSWORD', '1234'),
			ssl: env.bool('DATABASE_SSL', false)
		}
	}
});
