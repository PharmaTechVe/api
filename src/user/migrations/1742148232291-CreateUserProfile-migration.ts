import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserProfileMigration1742148232291
  implements MigrationInterface
{
  name = 'CreateUserProfileMigration1742148232291';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_profile_gender_enum" AS ENUM('m', 'f')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profilePicture" character varying NOT NULL, "birthDate" date NOT NULL, "gender" "public"."user_profile_gender_enum" NOT NULL, "user_id" uuid, CONSTRAINT "REL_eee360f3bff24af1b689076520" UNIQUE ("user_id"), CONSTRAINT "PK_f44d0cd18cfd80b0fed7806c3b7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profile" ADD CONSTRAINT "FK_eee360f3bff24af1b6890765201" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_profile" DROP CONSTRAINT "FK_eee360f3bff24af1b6890765201"`,
    );
    await queryRunner.query(`DROP TABLE "user_profile"`);
    await queryRunner.query(`DROP TYPE "public"."user_profile_gender_enum"`);
  }
}
