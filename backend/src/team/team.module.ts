import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { EmailModule } from '../email/email.module';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
