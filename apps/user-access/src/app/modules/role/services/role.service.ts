import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../repositories/role.repository';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  getAll() {
    return this.roleRepository.getAll();
  }
  getById(id: string) {
    return this.roleRepository.getById(id);
  }
  getByName(name: string) {
    return this.roleRepository.getByName(name);
  }
}
