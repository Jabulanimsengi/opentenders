import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SyncService } from '../src/sync/sync.service';

function readNumberArg(name: string) {
  const inline = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (inline) return Number(inline.split('=').slice(1).join('='));

  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return Number(process.argv[index + 1]);

  return undefined;
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const syncService = app.get(SyncService);
    const summary = await syncService.refreshRecentAwards({
      daysBack: readNumberArg('daysBack'),
      limit: readNumberArg('limit'),
      delayMs: readNumberArg('delayMs'),
    });

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
