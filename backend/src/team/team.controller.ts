import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TeamService } from './team.service';

@Controller('team')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  getTeam(@Request() req: { user: { id: string } }) {
    return this.teamService.getTeam(req.user.id);
  }

  @Post('invite')
  inviteMember(
    @Request() req: { user: { id: string } },
    @Body() body: { email: string; role?: string },
  ) {
    return this.teamService.inviteMember(req.user.id, body.email, body.role);
  }
}
