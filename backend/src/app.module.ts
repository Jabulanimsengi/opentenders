import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { TendersModule } from './tenders';
import { EmailModule } from './email/email.module';
import { SyncModule } from './sync/sync.module';
import { SavedSearchesModule } from './saved/saved-searches.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { AdminModule } from './admin';
import { AlertsModule } from './alerts';
import { DocumentsModule } from './documents/documents.module';
import { ExternalSourcesModule } from './external-sources';
import { TypesenseModule } from './typesense';
import { TeamModule } from './team/team.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL_MS || 60000),
        limit: Number(process.env.THROTTLE_LIMIT || 120),
      },
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    TypesenseModule,
    AuthModule,
    TendersModule,
    EmailModule,
    SyncModule,
    SavedSearchesModule,
    BookmarksModule,
    AdminModule,
    AlertsModule,
    DocumentsModule,
    ExternalSourcesModule,
    TeamModule,
    SubscriptionsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
