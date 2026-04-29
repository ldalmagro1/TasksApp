import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
} from 'typeorm';
import { Note } from '../../notes/entities/note.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @ManyToMany(() => Note, (note) => note.categories)
  notes: Note[];

  @CreateDateColumn()
  createdAt: Date;
}
