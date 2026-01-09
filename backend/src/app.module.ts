import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { TendersModule } from './tenders';
import { EmailModule } from './email/email.module';
import { SyncModule } from './sync/sync.module';
import { SavedSearchesModule } from './saved/saved-searches.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { TypesenseModule } from './typesense';
import { AdminModule } from './admin';
import { AlertsModule } from './alerts';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    TendersModule,
    EmailModule,
    SyncModule,
    SavedSearchesModule,
    BookmarksModule,
    TypesenseModule,
    AdminModule,
    AlertsModule,
  ],
})
export class AppModule { }
