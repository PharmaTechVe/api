import * as bcrypt from 'bcryptjs';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDefaultAdminMigration1748541346159
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      throw new Error(
        'ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set',
      );
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const id = '88e4e6de-77fb-49d4-8ec2-d925e3a29a55';
    await queryRunner.query(`
            INSERT INTO public.user (id, email, password, role, first_name, last_name, document_id, is_validated)
            VALUES (
                '${id}',
                '${adminEmail}',
                '${hashedPassword}',
                'admin',
                'Administrador',
                'Pharmatech',
                '1',
                true
            );
            INSERT INTO public.profile (user_id, birth_date)
            VALUES (
                '${id}',
                '2000-01-01'
            );
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      throw new Error('ADMIN_EMAIL environment variable must be set');
    }
    await queryRunner.query(`
            DELETE FROM public.user WHERE email = '${adminEmail}';
            DELETE FROM public.profile WHERE user_id = (
                SELECT id FROM public.user WHERE email = '${adminEmail}'
            );
        `);
  }
}
