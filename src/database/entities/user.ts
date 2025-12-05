import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryColumn()
  id!: string;

  @Column()
  age!: number;

  @Column()
  oblastOrCity!: string;

  @Column()
  whereFoundServer!: string;

  @Column()
  haveBeenOnSimilarServers!: boolean;
}