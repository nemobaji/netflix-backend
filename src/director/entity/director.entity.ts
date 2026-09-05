import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from '../../movie/entity/movie.entity';

@Entity()
export class Director {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  dob: Date;

  @Column()
  nationality: string;

  @OneToMany(() => Movie, (movie) => movie.director)
  movies: Movie[];
}
