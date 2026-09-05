import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Director } from './entity/director.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ) {}

  create(createDirectorDto: CreateDirectorDto) {
    return this.directorRepository.save(createDirectorDto);
  }

  findAll() {
    return this.directorRepository.find();
  }

  async findOne(id: number) {
    const director = await this.directorRepository.findOne({ where: { id } });
    if (!director) {
      throw new NotFoundException('해당 id의 감독이 존재하지 않습니다.');
    }
    return director;
  }

  async update(id: number, updateDirectorDto: UpdateDirectorDto) {
    const director = await this.directorRepository.findOne({ where: { id } });
    if (!director) {
      throw new NotFoundException('해당 id의 감독이 존재하지 않습니다.');
    }
    await this.directorRepository.update({ id }, { ...updateDirectorDto });
    const newDirector = await this.directorRepository.findOne({
      where: { id },
    });
    return newDirector;
  }

  remove(id: number) {
    return this.directorRepository.delete(id);
  }
}
