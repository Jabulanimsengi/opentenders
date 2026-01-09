"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const prisma_1 = require("./prisma");
const auth_1 = require("./auth");
const tenders_1 = require("./tenders");
const email_module_1 = require("./email/email.module");
const sync_module_1 = require("./sync/sync.module");
const saved_searches_module_1 = require("./saved/saved-searches.module");
const bookmarks_module_1 = require("./bookmarks/bookmarks.module");
const typesense_1 = require("./typesense");
const admin_1 = require("./admin");
const alerts_1 = require("./alerts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_1.PrismaModule,
            auth_1.AuthModule,
            tenders_1.TendersModule,
            email_module_1.EmailModule,
            sync_module_1.SyncModule,
            saved_searches_module_1.SavedSearchesModule,
            bookmarks_module_1.BookmarksModule,
            typesense_1.TypesenseModule,
            admin_1.AdminModule,
            alerts_1.AlertsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map