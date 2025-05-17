import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActivePrincipleMigration1747107651171
  implements MigrationInterface
{
  name = 'AddActivePrincipleMigration1747107651171';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "active_principle" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(255) NOT NULL, CONSTRAINT "PK_872c6d07a950a9ec64da5714eb6" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "active_principle"`);
  }
}
