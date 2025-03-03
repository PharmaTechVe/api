import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserEntityMigration1741036268454
  implements MigrationInterface
{
  name = 'CreateUserEntityMigration1741036268454';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'branch_admin', 'customer', 'delivery')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIME WITH TIME ZONE, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "password" character varying NOT NULL, "email" character varying NOT NULL, "document_id" character varying NOT NULL, "phone_number" character varying NOT NULL, "last_order_date" TIMESTAMP WITH TIME ZONE, "role" "public"."user_role_enum" NOT NULL DEFAULT 'customer', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_18a41ed5aafb9732cfa62c8debd" UNIQUE ("document_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
}
