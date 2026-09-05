import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entity/movie.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  findAll(title?: string) {
    if (!title) {
      return this.movieRepository.find();
    }

    return this.movieRepository.find({ where: { title: Like(`%${title}%`) } });
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({ where: { id } });
    return movie;
  }

  async create(createMovieDto: CreateMovieDto) {
    const movie = await this.movieRepository.save(createMovieDto);
    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }
    await this.movieRepository.update({ id }, updateMovieDto);
    const newMovie = await this.movieRepository.findOne({ where: { id } });
    return newMovie;
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }
    await this.movieRepository.delete(id);
    return id;
  }
}
