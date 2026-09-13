import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entity/movie.entity';
import { In, Repository } from 'typeorm';
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

  async findAll(title?: string) {
    const qb = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', { title: `%${title}%` });
    }

    return qb.getManyAndCount();
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
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: { director: true, genres: true },
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }

    const { directorId, genreIds, ...movieRest } = updateMovieDto;

    // 감독 정보 검증 및 할당
    if (directorId) {
      const director = await this.directorRepository.findOne({
        where: { id: directorId },
      });
      if (!director) {
        throw new NotFoundException('해당 id의 감독이 존재하지 않습니다.');
      }
      movie.director = director;
    }

    // 장르 정보 검증 및 할당
    if (genreIds) {
      const genres = await this.genreRepository.find({
        where: { id: In(genreIds) },
      });

      if (genres.length !== genreIds.length) {
        throw new NotFoundException(
          `존재하지 않는 장르 ID가 포함되어 있습니다. 존재하는 id: ${genres.map((g) => g.id).join(', ')}`,
        );
      }
      movie.genres = genres;
    }

    // 일반 필드 병합 후 save로 단일 트랜잭션 저장
    Object.assign(movie, movieRest);
    await this.movieRepository.save(movie);

    return this.movieRepository.findOne({
      where: { id },
      relations: { director: true, genres: true },
    });
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
