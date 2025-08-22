import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Get,
  Param,
  Res,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
/* eslint-disable prettier/prettier, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileResponseDto } from './dto/file-response.dto';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ type: FileResponseDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const now = new Date();
          const yyyy = now.getFullYear().toString();
          const mm = (now.getMonth() + 1).toString().padStart(2, '0');
          const uploadDir = join('storage', 'uploads', yyyy, mm);
          const absolute = join(process.cwd(), uploadDir);
          if (!existsSync(absolute)) {
            mkdirSync(absolute, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const unique = randomUUID();
          const ext = extname(file.originalname);
          cb(null, `${unique}${ext}`);
        },
      }),
    }),
  )
  async upload(
    @UploadedFile() file: any,
    @Req() req: any,
  ): Promise<FileResponseDto> {
    const saved = await this.filesService.upload(file, req.user.userId);
    return {
      id: saved.id,
      originalName: saved.originalName,
      mimeType: saved.mimeType,
      size: saved.size,
      url: `/api/files/${saved.id}/download`,
    };
  }

  @Get(':id/download')
  async download(
    @Param('id', new ParseIntPipe()) id: number,
    @Res() res: Response,
  ) {
    const { meta, stream } = await this.filesService.getFile(id);

    res.setHeader('Content-Type', meta.mimeType);
    res.setHeader('Content-Length', meta.size.toString());
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(meta.originalName)}"`,
    );

    stream.pipe(res);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  async delete(@Param('id', new ParseIntPipe()) id: number, @Req() req: any) {
    await this.filesService.deleteFile(id, req.user);
    return { success: true };
  }
}
