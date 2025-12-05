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
}