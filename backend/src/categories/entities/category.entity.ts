import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Note } from '../../notes/entities/note.entity';
import { User } from '../../users/entities/user.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @ManyToMany(() => Note, (note) => note.categories)
  notes: Note[];

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @DeleteDateColumn()
  deletedAt: Date;
}
