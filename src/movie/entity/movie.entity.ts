import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Director } from '../../director/entity/director.entity';
import { Genre } from '../../genre/entity/genre.entity';

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable()
  genres: Genre[];

  @Column()
  detail: string;

  @Column({
    default: 0,
  })
  likeCount: number;

  @ManyToOne(() => Director, (director) => director.id, { nullable: false })
  director: Director;
}
