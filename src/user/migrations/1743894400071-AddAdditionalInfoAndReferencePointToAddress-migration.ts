import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdditionalInfoAndReferencePointToAddressMigration1743894400071
  implements MigrationInterface
{
  name = 'AddAdditionalInfoAndReferencePointToAddressMigration1743894400071';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_address" ADD "additional_information" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_address" ADD "reference_point" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_address" DROP COLUMN "reference_point"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_address" DROP COLUMN "additional_information"`,
    );
  }
}
