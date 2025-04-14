import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserMotoMigration1744589286586 implements MigrationInterface {
  name = 'AddUserMotoMigration1744589286586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_moto" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "brand" character varying, "model" character varying, "color" character varying, "plate" character varying, "license_url" character varying, "user_id" uuid, CONSTRAINT "UQ_ad4f90448fd60ff2f9e98d9407c" UNIQUE ("plate"), CONSTRAINT "REL_5a25a88fbdd887d1b4350f85b0" UNIQUE ("user_id"), CONSTRAINT "PK_9886344b179f2ccef8640312823" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_moto" ADD CONSTRAINT "FK_5a25a88fbdd887d1b4350f85b05" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_moto" DROP CONSTRAINT "FK_5a25a88fbdd887d1b4350f85b05"`,
    );
    await queryRunner.query(`DROP TABLE "user_moto"`);
  }
}
