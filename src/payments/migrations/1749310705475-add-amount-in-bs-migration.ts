import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAmountInBsMigration1749310705475 implements MigrationInterface {
  name = 'AddAmountInBsMigration1749310705475';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_confirmation" ADD "amount_bs" integer NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_confirmation" DROP COLUMN "amount_bs"`,
    );
  }
}
