import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryColumn()
  id!: string;

  @Column()
  age!: number;

  @Column({ name: 'oblast_or_city' })
  oblastOrCity!: string;

  @Column({ name: 'where_found_server' })
  whereFoundServer!: string;

  @Column({ name: 'have_been_on_similar_servers' })
  haveBeenOnSimilarServers!: boolean;

  @Column()
  username!: string;

  @Column({ type: 'varchar', nullable: true })
  global_name!: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatar!: string | null;

  @Column({ type: 'varchar', nullable: true })
  banner!: string | null;

  @Column({ type: 'int', nullable: true })
  accent_color!: number | null;
}