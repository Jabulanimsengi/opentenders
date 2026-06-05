import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // GET /api/admin/users - List all users
  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      search,
    );
  }

  // GET /api/admin/users/:id - Get single user
  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  // PATCH /api/admin/users/:id/subscription - Update subscription
  @Patch('users/:id/subscription')
  async updateSubscription(
    @Param('id') id: string,
    @Body() body: { plan: string; status?: string },
  ) {
    return this.adminService.updateSubscription(id, body.plan, body.status);
  }

  // PATCH /api/admin/users/:id/role - Update user role
  @Patch('users/:id/role')
  async updateRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.adminService.updateRole(id, body.role);
  }

  // DELETE /api/admin/users/:id - Delete user
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }
}
