import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entity/movie.entity';
import { In, Like, Repository } from 'typeorm';
import { Director } from '../director/entity/director.entity';
import { Genre } from '../genre/entity/genre.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  findAll(title?: string) {
    if (!title) {
      return this.movieRepository.find({
        relations: { director: true, genres: true },
      });
    }

    return this.movieRepository.find({
      where: { title: Like(`%${title}%`) },
      relations: { director: true, genres: true },
    });
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: { director: true, genres: true },
    });
    return movie;
  }

  async create(createMovieDto: CreateMovieDto) {
    const director = await this.directorRepository.findOne({
      where: { id: createMovieDto.directorId },
    });
    if (!director) {
      throw new NotFoundException('해당 id의 감독이 존재하지 않습니다.');
    }

    const genres = await this.genreRepository.find({
      where: { id: In(createMovieDto.genreIds) },
    });
    if (genres.length !== createMovieDto.genreIds.length) {
      throw new NotFoundException(
        `해당 id의 장르가 존재하지 않습니다. 존재하는 id: ${genres.map((genre) => genre.id).join(',')}`,
      );
    }

    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      detail: createMovieDto.detail,
      director,
      genres,
    });
    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }
    const { directorId, genreIds, ...movieRest } = updateMovieDto;

    // director가 요청에 포함되어있는지 확인
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

    // genre가 요청에 포함되어있는지 확인
    let newGenres;
    if (genreIds) {
      const genres = await this.directorRepository.find({
        where: { id: In(genreIds) },
      });
      if (genreIds.length !== updateMovieDto.genreIds?.length) {
        throw new NotFoundException(
          `해당 id의 감독이 존재하지 않습니다. 존재하는 id: ${genres.map((genre) => genre.id).join(',')}`,
        );
      }
      newGenres = genres;
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
    if (newMovie && newGenres) {
      newMovie.genres = newGenres;
      await this.movieRepository.save(newMovie);
    }

    return this.movieRepository.findOne({ where: { id } });
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
