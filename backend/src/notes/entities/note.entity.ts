import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true, default: '' })
  content: string;

  @Column({ default: false })
  archived: boolean;

  @Column({ type: 'date', nullable: true })
  date: string | null;

  @ManyToMany(() => Category, (category) => category.notes, { eager: true })
  @JoinTable({
    name: 'note_categories',
    joinColumn: { name: 'note_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.notes, { onDelete: 'CASCADE' })
  user: User;
}
