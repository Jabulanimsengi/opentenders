import { ConfigService } from '@nestjs/config';

const DEFAULT_SECRETS = new Set([
  '',
  'your-secret-key',
  'your-auth-secret-key-change-in-production',
]);

export function getJwtSecret(configService: ConfigService) {
  const configuredSecret = configService.get<string>('JWT_SECRET')?.trim();

  if (configuredSecret && !DEFAULT_SECRETS.has(configuredSecret)) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set to a strong production secret');
  }

  return 'development-only-jwt-secret-change-me';
}

export function getAllowedOrigins() {
  const configuredOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins?.length) {
    return configuredOrigins;
  }

  return [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];
}
