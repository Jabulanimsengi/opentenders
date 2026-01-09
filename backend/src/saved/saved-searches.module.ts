import { Module } from '@nestjs/common';
import { SavedSearchesService } from './saved-searches.service';
import { SavedSearchesController } from './saved-searches.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [SavedSearchesService],
    controllers: [SavedSearchesController],
    exports: [SavedSearchesService],
})
export class SavedSearchesModule { }
