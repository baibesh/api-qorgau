import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createReadStream, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async upload(file: Express.Multer.File, userId: number) {
    const { originalname, size, mimetype, path } = file;
    this.logger.debug(`Uploading file: ${originalname}, size: ${size}`);
    try {
      const created = await this.prisma.file.create({
        data: {
          originalName: originalname,
          mimeType: mimetype,
          size: size,
          path: path,
          createdBy: userId,
        },
      });
      return created;
    } catch (err: unknown) {
      const details =
        err instanceof Error ? err.stack || err.message : String(err);

      this.logger.error(
        `Failed to save file metadata in DB. Details: ${details}`,
      );
      throw new InternalServerErrorException('Failed to save file metadata');
    }
  }

  async getFile(id: number) {
    const meta = await this.prisma.file.findUnique({ where: { id } });
    if (!meta) {
      throw new NotFoundException('File not found');
    }

    const absolutePath = join(process.cwd(), meta.path);
    if (!existsSync(absolutePath)) {
      this.logger.warn(`File missing on disk: ${absolutePath}`);
      throw new NotFoundException('File not found on disk');
    }

    const stream = createReadStream(absolutePath);
    return { meta, stream };
  }

  async deleteFile(
    id: number,
    requester: { userId: number; isAdmin: boolean },
  ) {
    const meta = await this.prisma.file.findUnique({ where: { id } });
    if (!meta) {
      throw new NotFoundException('File not found');
    }

    if (!(requester.isAdmin || meta.createdBy === requester.userId)) {
      throw new ForbiddenException(
        'You do not have permission to delete this file',
      );
    }

    // Try to delete file from disk first (best-effort), then remove DB record
    const absolutePath = join(process.cwd(), meta.path);
    try {
      if (existsSync(absolutePath)) {
        unlinkSync(absolutePath);
      } else {
        this.logger.warn(`File to delete not found on disk: ${absolutePath}`);
      }
    } catch (e: unknown) {
      const details = e instanceof Error ? e.stack || e.message : String(e);
      this.logger.error(
        `Failed to delete file from disk: ${absolutePath}. Details: ${details}`,
      );
      // Continue to delete DB record anyway
    }

    await this.prisma.file.delete({ where: { id } });
    return meta;
  }
}
