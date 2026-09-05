import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entity/movie.entity';
import { Like, Repository } from 'typeorm';
import { Director } from '../director/entity/director.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
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
    const director = await this.directorRepository.findOne({
      where: { id: createMovieDto.directorId },
    });
    if (!director) {
      throw new NotFoundException('해당 id의 감독이 존재하지 않습니다.');
    }

    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre,
      detail: createMovieDto.detail,
      director,
    });
    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }
    const { directorId, ...movieRest } = updateMovieDto;
    let newDirector;
    if (directorId) {
      const director = await this.directorRepository.findOne({
        where: { id: directorId },
      });
      if (!director) {
        throw new NotFoundException('해당 id의 감독이 존재하지 않습니다.');
      }
      newDirector = director;
    }
    const movieUpdateFields = {
      ...movieRest,
      ...(newDirector && { director: newDirector }),
    };
    await this.movieRepository.update({ id }, movieUpdateFields);
    const newMovie = await this.movieRepository.findOne({
      where: { id },
      relations: { director: true },
    });
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
